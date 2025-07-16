import { RequestyLLM } from "@/lib/requesty";
import { createWorkflow, workflowEvent } from "@llamaindex/workflow-core";
import { NextResponse } from "next/server";
import { createStatefulMiddleware } from "@llamaindex/workflow-core/middleware/state";
import { pipeline } from "node:stream/promises";
import { z } from "zod";
// import { collect } from "@llamaindex/workflow-core/stream/consumer";
// import { until } from "@llamaindex/workflow-core/stream/until";
// import { filter } from "@llamaindex/workflow-core/stream/filter";


const TEST_ANFRAGE = `
Hi Laureen,

 

ich hoffe bei dir ist alles gut 😊

 

Heute habe ich mal wieder das Briefing für eine Apple Pay Kampagne für dich. Ziel Umfeld ist Travel. Nachfolgend das komplette Briefing:

 

Kampagnenname: Q325 DE Apple Pay Everyday Display
Zeitraum: 02.06. – 28.06.2025
Umfelder: ROC Reise, wir würden diesen aber gerne noch ein bisschen anpassen und nur die folgenden Seiten & Rubriken belegen: Frankfurter Allgemeine (Reise), Fachmedien & Mittelstand (Touristik & Business Travel), Manager Magazin (Reise), Spiegel (Leben->Reise), Süddeutsche Zeitung (Reise), Tagesspiegel (Gesellschaft->Reise), Zeit online (Entdecken->Reise)
Formate: Statische Banner (300x250, 160x600, 320x50, 728x90, 300x600, 320x480, 970x250)
Devices: IOS/MacOS only
Budget: max. Verfügbarkeiten
 

Wie ab jetzt immer, sollen natürlich auch hier die ausgemachten Brand Safety Regelungen angewendet werden (Keyword Ausschlüsse laut Liste im Anhang, IAS Brand Safety Einstellungen und ganzheitlicher Ausschluss von Politik). Könntest du uns dazu bitte bis spätestens Donnerstag 20.03. 12 Uhr ein Angebot zukommen lassen?

Melde dich gerne, sollte es noch Fragen geben 😊

 

Liebe Grüße

Paula
`

const offerSchema = z.object({
    customer: z.string().describe("Name des Kunden"),
    campagneName: z.string().describe("Name der Kampagne"),
    zeitraum: z.string().describe("Zeitraum der Kampagne"),
    umfelder: z.array(z.string()).describe("Umfelder der Kampagne"),
    formate: z.array(z.string()).describe("Formate der Kampagne"),
    devices: z.array(z.string()).describe("Devices der Kampagne"),
    budget: z.string().describe("Budget der Kampagne"),
    wichtige_informationen: z.array(z.string()).describe("Wichtige Informationen der Kampagne"),
  });



export async function GET() {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            // const eventSource = new EventSource('/api/run-workflow');
            controller.enqueue(encoder.encode("data: Connected to workflow\n\n"));

            // init requesty client 
            const llm = new RequestyLLM({
                baseURL: process.env.REQUESTY_BASE_URL, 
                apiKey: process.env.REQUESTY_API_KEY, 
                model: "openai/gpt-4o-mini" 
            })

             // init workflow -> Parse the request, get the offer data (eventual add new step, 
            // where we fetch customer data and past transactions)
            const startEvent = workflowEvent<{
                anfrage: string | null,
               }>()

            const orchestrateEvent = workflowEvent<{
                offerData: z.infer<typeof offerSchema> | null,
            }>()

            // Parallel events Branching 
          
            const fetchAGMEvent = workflowEvent<{
                offerData: z.infer<typeof offerSchema> | null,
            }>()
            const testEvent = workflowEvent<{
                offerData: z.infer<typeof offerSchema> | null,
            }>()

            const BranchingCompleteEvent = workflowEvent<{
                res: string | null,
            }>()


           
            const offerEvent = workflowEvent<{
                offerData: z.infer<typeof offerSchema> | null,
                agmaResult: string | null,
                testResult: string | null,
            }>()

            const stopEvent = workflowEvent<{
                result: string | null,
            }>()

            const { withState, getContext } = createStatefulMiddleware(()=>({
                anfrage: null as string | null,
                offerData: null as z.infer<typeof offerSchema> | null,
                res: null as string | null,
                agmaResult: null as string | null,
                testResult: null as string | null,
                result: null as string | null,
              }))

            const workflow = withState(createWorkflow());


            // handle the start event, which is either a new topic
      // or a loop with feedback for additional research
      workflow.handle([startEvent], async (start) => {
        console.log("Workflow gestartet mit Anfrage: ", start.data.anfrage)
        console.log("--------------------------------")

        const { state } = getContext()

        // store the topic in case we need to loop
        state.anfrage = start.data.anfrage
        let prompt = `Folgende Anfrage erhalten: <anfrage>${start.data.anfrage}</anfrage>. Extrahiere die relevanten Informationen.`



        // get the research
        let result = await llm.complete({prompt:prompt, responseFormat: offerSchema})

        const parsedResult = offerSchema.parse(JSON.parse(result.text))
        console.log("Result is ", parsedResult)
        return orchestrateEvent.with({offerData:parsedResult})
        // return orchestrateEvent.with(result.text)
      });

      workflow.handle([orchestrateEvent], async (orchestrate) => {
        const { sendEvent, stream} = getContext()
        sendEvent(fetchAGMEvent.with({offerData:orchestrate.data.offerData}))
        sendEvent(testEvent.with({ offerData: orchestrate.data.offerData }))
       
       
       let condition = 0 


        try {
            const results = await stream
            .filter(BranchingCompleteEvent)
            .until(()=> {
                condition++
                return condition === 2
            })
            .toArray()

            console.log("--------------------------------")
            console.log("Results are ", results)
            sendEvent(stopEvent.with({result: results.map((ev) => ev.data.res).join(", ")}))
        } catch (error) {
            console.error("Error is ", error)
        }









       
      });


      workflow.handle([fetchAGMEvent], async (fetchAGM) => {


        // TODO: Fetch AGMA API 
        
        console.log("Fetching AGM, data is ", fetchAGM.data)
            return BranchingCompleteEvent.with({res: "Fetching the AGMA API, for the request"})

      });

      workflow.handle([testEvent], async (test) => {
        console.log("Test event, data is ", test.data)
            return BranchingCompleteEvent.with({res: "Fetching the Product and Price Data, for the request"})
      });


      // Create a workflow context and send the initial event
      const { stream, sendEvent } = workflow.createContext();
      sendEvent(startEvent.with({anfrage:TEST_ANFRAGE}));


       // Process the stream to get the result
       pipeline(stream, async function (source) {
        for await (const event of source as any) {
          console.log("Got a new event", event.data)
          controller.enqueue(encoder.encode("data: " + JSON.stringify(event.data)+"\n\n"));  
          if (stopEvent.include(event)) {
            controller.close();
          }
        }
      });




        }
    })
    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    })
}