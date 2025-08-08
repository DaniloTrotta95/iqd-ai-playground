import { createWorkflow, workflowEvent } from "@llamaindex/workflow-core";
import { agent } from "@llamaindex/workflow";
import { tool } from "llamaindex"
import { NextResponse } from "next/server";
import { createStatefulMiddleware } from "@llamaindex/workflow-core/middleware/state";
import { pipeline } from "node:stream/promises";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { client, clientTopics, publisher, topics } from "@/db/schema";
import { requesty } from "@requesty/llamaindex";

// import { collect } from "@llamaindex/workflow-core/stream/consumer";
// import { until } from "@llamaindex/workflow-core/stream/until";
// import { filter } from "@llamaindex/workflow-core/stream/filter";
import { eq, asc } from "drizzle-orm";

const salesForceCustomerSchema = z.object({
    contactId: z.string().describe("The ID of the contact in SalesForce"),
    name: z.string().describe("The name of the contact"),
    email: z.string().describe("The email of the contact"),
    phone: z.string().describe("The phone of the contact"),
    accountId: z.string().describe("The ID of the account in SalesForce linked to the contact"),
    accountName: z.string().describe("The name of the account in SalesForce linked to the contact"),
    opportunities: z.array(z.object({
        id: z.string().describe("The ID of the opportunity in SalesForce linked to the account"),
        opportunityName: z.string().describe("The name of the opportunity in SalesForce linked to the account"),
        stage: z.string().describe("The stage of the opportunity in SalesForce linked to the account"),
        closeDate: z.string().describe("The close date of the opportunity in SalesForce linked to the account"),
    })),
    hasBeenFound: z.boolean().describe("Whether the contact has been found in SalesForce"),
})

const getSalesForceAPIAccessToken = async () => {
    console.log("Fetching access token... in getSalesForceAPIAccessToken")
    
    const response = await fetch(`https://iqdigital--sprintsv2.sandbox.my.salesforce.com/services/oauth2/token?username=${process.env.SALESFORCE_USERNAME}&password=${process.env.SALESFORCE_PASSWORD}${process.env.SALESFORCE_SECURITY_TOKEN}&grant_type=password&client_id=${process.env.SALESFORCE_ACCESS_KEY}&client_secret=${process.env.SALESFORCE_SECRET}`, {
        method: "POST",
        // body: JSON.stringify({
        //     grant_type: "password",
        //     client_id: process.env.SALESFORCE_ACCESS_KEY,
        //     client_secret: process.env.SALESFORCE_SECRET,
        //     username: process.env.SALESFORCE_USERNAME,
        //     password: `${process.env.SALESFORCE_PASSWORD}${process.env.SALESFORCE_SECURITY_TOKEN}`,
        // }),
    });
    console.log("Response is ", response)
    const data = await response.json();
    console.log("Data is ", data)
    return data.access_token;
}

const searchContactInSalesForce = async ({
    email,
    accessToken,
}: {
    email: string;
    accessToken: string;
}) => {
    console.log("Searching for contact in SalesForce with email: ", email)
    console.log("fetching access token...")
    // const accessToken = await getSalesForceAPIAccessToken();
    // return {
    //     accessToken,
    // };
    console.log("access token fetched:", accessToken)
    console.log("fetching contact...")
    const response = await fetch(`https://iqdigital--sprintsv2.sandbox.my.salesforce.com/services/data/v55.0/query/?q=SELECT+Id,+FirstName,+LastName,+Email,+Phone,+Account.Id,+Account.Name+FROM+Contact+WHERE+Email='${email}'`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
        method: "GET",
    });
    const data = await response.json();
    const contact = data.records[0];
    console.log("contact fetched:", JSON.stringify(contact, null, 2))
    return JSON.stringify(contact);
  
}
const searchOpportunitiesInSalesForce = async ({
    accountId,
    accessToken,
}: {
    accountId: string;
    accessToken: string;
}) => {

    const response = await fetch(`https://iqdigital--sprintsv2.sandbox.my.salesforce.com/services/data/v55.0/query/?q=SELECT+Id,+Name,+StageName,+CloseDate+FROM+Opportunity+WHERE+AccountId='${accountId}'`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
        method: "GET",
    });
    const data = await response.json();
    const opportunities = data.records;
    console.log("opportunities fetched:", JSON.stringify(opportunities, null, 2))
    return JSON.stringify(opportunities);
  
}




    const searchContactInSalesForceTool = tool({
        name: "searchContactInSalesForce",
        description: "Search for a contact in SalesForce using a email address",
        parameters: z.object({
            email: z.string().describe("Email address of the contact to search for"),
            accessToken: z.string().describe("Access token for the SalesForce API"),
        }).describe("The email address of the contact to search for"),
        execute: searchContactInSalesForce
        
    })

    const searchOpportunitiesInSalesForceTool = tool({
        name: "searchOpportunitiesInSalesForce",
        description: "Search for opportunities in SalesForce using an account ID",
        parameters: z.object({
            accountId: z.string().describe("Account ID of the account to search for"),
            accessToken: z.string().describe("Access token for the SalesForce API"),
        }).describe("The account ID of the account to search for"),
        execute: searchOpportunitiesInSalesForce
    })

const TEST_ANFRAGE = `
Email von:  Alessandra.maffei@phdmedia.de

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

Alessandra
`

const offerSchema = z.object({
    customer: z.string().describe("Name des Kunden"),
    agency: z.string().describe("Name der Agentur"),
    contact: z.string().describe("Name des Kontakts"),
    email: z.string().describe("Email des Kontakts"),
    campagneName: z.string().describe("Name der Kampagne"),
    zeitraum: z.string().describe("Zeitraum der Kampagne"),
    produkt: z.string().describe("Das vom Kunden gewünschte Produkt welches er bei uns buchen möchte. Z.B. ROC Reise bedeutet Rotation on Channel auf dem Channel Reise"),
    umfelder: z.array(z.object({
        seite: z.string().describe("Gewünschte Seite auf der die Kampagne platziert werden soll"),
        rubrik: z.string().describe("Gewümschte Rubrik innerhalb der Seite auf der die Kampagne platziert werden soll"),
    })),
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
            const llm = requesty({
                baseURL: process.env.REQUESTY_BASE_URL, 
                apiKey: process.env.REQUESTY_API_KEY, 
                model: "google/gemini-2.0-flash-001" 
            })
            // const llm4o = requesty({
            //     baseURL: process.env.REQUESTY_BASE_URL, 
            //     apiKey: process.env.REQUESTY_API_KEY, 
            //     model: "openai/gpt-4o" 
            // })

            const salesForceAgent = agent({
                name: "salesForceAgent",
                tools: [searchContactInSalesForceTool, searchOpportunitiesInSalesForceTool],
                llm: llm,
            })

             // init workflow -> Parse the request, get the offer data (eventual add new step, 
            // where we fetch customer data and past transactions)
            const startEvent = workflowEvent<{
                anfrage: string | null,
               }>()

            const fetchCustomerDataEvent = workflowEvent<{
                customerData: any | null,
            }>()

            const orchestrateEvent = workflowEvent<{
                offerData: z.infer<typeof offerSchema> | null,
                salesForceCustomer: z.infer<typeof salesForceCustomerSchema> | null,
            }>()

            // Parallel events Branching 
          
            const fetchAGMEvent = workflowEvent<{
                offerData?: z.infer<typeof offerSchema> | null,
            }>()
            const fetchPortfolioEvent = workflowEvent<{
                offerData: z.infer<typeof offerSchema> | null,
            }>()

            const BranchingCompleteEvent = workflowEvent<{
                fetchPortfolio: {
                    inOurPortfolio: string[] | null,
                    notInOurPortfolio: string[] | null,
                } | null,
                fetchAGM: string | null,
            }>()


           
            // const offerEvent = workflowEvent<{
            //     offerData: z.infer<typeof offerSchema> | null,
            //     agmaResult: string | null,
            //     testResult: string | null,
            // }>()

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
        const prompt = `Folgende Anfrage erhalten: <anfrage>${start.data.anfrage}</anfrage>. Extrahiere die relevanten Informationen.`



        // get the research
        const result = await llm.complete({prompt:prompt, responseFormat: offerSchema})

        const parsedResult = offerSchema.parse(JSON.parse(result.text))
        // console.log("Result is ", parsedResult)
        return fetchCustomerDataEvent.with({customerData:parsedResult})
        // return orchestrateEvent.with(result.text)
      });


      workflow.handle([fetchCustomerDataEvent], async (fetchCustomerData) => {
        console.log("Fetching customer data, data is ", fetchCustomerData.data)

        const accessToken = await getSalesForceAPIAccessToken();

        console.log("Access token is ", accessToken)

        const salesForceResult = await salesForceAgent.run(`Find the contact for the email ${fetchCustomerData.data.customerData.email} in SalesForce, use the access token ${accessToken}, 
            after getting the contact, fetch all opportunieties for the account liked to the contact, use the accountId for this.
            Return the contact, with all the information and the opportunities in a structured way.
            If the contact has not been found, just return the text "NOT FOUND"`)
        
        console.log("SalesForce result is ", salesForceResult.data)
        const structuredSalesForceResult = await llm.complete({
            prompt: `For the Email: ${fetchCustomerData.data.customerData.email} we got the following Salesforce result: ${salesForceResult.data.result}. 
            Extract the important information from the Salesforce result, 
            if the result contains the text "NOT FOUND", return the field hasBeenFound as false, try to fill out the fields with the information you have, maybe you can derivate the name from the email, but set the fields to null when you are certain that you dont have the information"`,
                responseFormat: salesForceCustomerSchema,
        })

        const parsedSalesForceResult = salesForceCustomerSchema.parse(JSON.parse(structuredSalesForceResult.text))

        console.log("Parsed sales force result is ", parsedSalesForceResult)
       

        return orchestrateEvent.with({offerData:fetchCustomerData.data.customerData, salesForceCustomer:parsedSalesForceResult})
      });

      workflow.handle([orchestrateEvent], async (orchestrate) => {
        const { sendEvent, stream} = getContext()
        
        // Send the offerData and salesForceCustomer data once
        sendEvent(workflowEvent<{offerData: any, salesForceCustomer: any}>().with({
          offerData: orchestrate.data.offerData,
          salesForceCustomer: orchestrate.data.salesForceCustomer
        }))
        
        // Send the branching events without offerData
        sendEvent(fetchAGMEvent.with({}))
        sendEvent(fetchPortfolioEvent.with({ offerData: orchestrate.data.offerData }))
       
       
       let condition = 0 

        try {
            const results = await stream
            .filter(BranchingCompleteEvent)
            .until(()=> {
                condition++
                return condition === 2
            })
            .toArray()

            sendEvent(stopEvent.with({result: results.map((ev) => ev.data.res).join(", ")}))
        } catch (error) {
            console.error("Error is ", error)
        }
      });


      workflow.handle([fetchAGMEvent], async (fetchAGM) => {


        // TODO: Fetch AGMA API 
        
        // console.log("Fetching AGM, data is ", fetchAGM.data)


            return BranchingCompleteEvent.with({fetchAGM: 'Fetching AGMA API', fetchPortfolio: null})

      });

      workflow.handle([fetchPortfolioEvent], async (fetchPortfolio) => {
        // console.log("Fetch Portfolio event, data is ", fetchPortfolio.data)

        // Get the Umfelder from the offer data
        const umfelder = fetchPortfolio.data.offerData?.umfelder

        // Get the mandanten from DB 
        const mandanten = await db
        .select({
            id: client.id,
            name: client.name,
            url: client.url,
            clientType: client.clientType,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            publisherId: client.publisherId,
            publisherName: publisher.name,
            topicId: clientTopics.topicId,
            topicName: topics.name,
            topicLabel: topics.label,
        })
        .from(client)
        .leftJoin(publisher, eq(client.publisherId, publisher.id))
        .leftJoin(clientTopics, eq(client.id, clientTopics.clientId))
        .leftJoin(topics, eq(clientTopics.topicId, topics.id))
        .orderBy(asc(client.createdAt));

        // console.log("Mandanten are ", mandanten)
        // console.log("Umfelder are ", umfelder)

        // Fix: Await the llm.complete call and ensure correct typing
        const mandantenUmfelderSchema = z.object({
          inOurPortfolio: z.array(z.string()).describe("Seiten aus dem Briefing, die in unserem Portfolio verfügbar sind"),
          notInOurPortfolio: z.array(z.string()).describe("Seiten aus dem Briefing, die NICHT in unserem Portfolio verfügbar sind"),
        });
        
        const mandantenUmfelder = await llm.complete({
          prompt: `Du bist ein Experte für unser Kunden Portfolio. Wir sind ein digitaler Vermarkter und haben ein Portfolio von Mandanten bei unterschiedlichen Publishern für Digital, Newsletter und Audio Vermarktung.

          UNSER PORTFOLIO:
          ${JSON.stringify(mandanten, null, 2)}

          BRIEFING ANFORDERUNGEN:
          ${JSON.stringify(fetchPortfolio.data.offerData?.umfelder, null, 2)}

          AUFGABE:
          Vergleiche die im Briefing gewünschten Seiten mit unserem Portfolio. Für jede gewünschte Seite aus dem Briefing:
          1. Prüfe ob wir diese Seite in unserem Portfolio haben
          2. Berücksichtige dabei den Seitennamen und mögliche abkürzungen
          3. Wenn eine Seite die im briefing gefordert wird und in unserem Portfolio ist, füge sie zu "inOurPortfolio" hinzu
          4. Wenn eine Seite die im briefing gefordert wird NICHT in unserem Portfolio ist, füge sie zu "notInOurPortfolio" hinzu

          WICHTIG: 
          - Vergleiche Seitennamen. Wir haben abkürzungen für manche Seiten, die FAZ bedeutet Frankfurter Allgemeine Zeitung, beachte dies bitte.
          - Sei präzise bei der Zuordnung
          - Wenn alle gewünschten Seiten/Rubriken in unserem Portfolio sind, gib leere Arrays zurück`,
          responseFormat: mandantenUmfelderSchema
        });

        const parsedMandantenUmfelder = mandantenUmfelderSchema.parse(JSON.parse(mandantenUmfelder.text))

        // console.log("Mandanten Umfelder are ", parsedMandantenUmfelder)

        // const parsedMandantenUmfelder = mandantenUmfelderSchema.parse(JSON.parse(mandantenUmfelder.text))



        
            return BranchingCompleteEvent.with({fetchPortfolio: {inOurPortfolio: parsedMandantenUmfelder.inOurPortfolio, notInOurPortfolio: parsedMandantenUmfelder.notInOurPortfolio}, fetchAGM: null})
      });


      // Create a workflow context and send the initial event
      const { stream, sendEvent } = workflow.createContext();
      sendEvent(startEvent.with({anfrage:TEST_ANFRAGE}));


       // Process the stream to get the result
       pipeline(stream, async function (source) {
        for await (const event of source as any) {
          console.log("Got a new event", event.data)
          
          // Send individual events based on the event type
          if (event.data.anfrage) {
            controller.enqueue(encoder.encode("data: " + JSON.stringify({anfrage: event.data.anfrage}) + "\n\n"));
          }
          
          if (event.data.customerData) {
            controller.enqueue(encoder.encode("data: " + JSON.stringify({customerData: event.data.customerData}) + "\n\n"));
          }
          
          // Send offerData and salesForceCustomer together from orchestrateEvent
          if (event.data.offerData && event.data.salesForceCustomer) {
            controller.enqueue(encoder.encode("data: " + JSON.stringify({offerData: event.data.offerData}) + "\n\n"));
            controller.enqueue(encoder.encode("data: " + JSON.stringify({salesForceCustomer: event.data.salesForceCustomer}) + "\n\n"));
          }
          
          if (event.data.fetchPortfolio) {
            if (event.data.fetchPortfolio.inOurPortfolio && event.data.fetchPortfolio.inOurPortfolio.length > 0) {
              controller.enqueue(encoder.encode("data: " + JSON.stringify({inOurPortfolio: event.data.fetchPortfolio.inOurPortfolio}) + "\n\n"));
            }
            
            if (event.data.fetchPortfolio.notInOurPortfolio && event.data.fetchPortfolio.notInOurPortfolio.length > 0) {
              controller.enqueue(encoder.encode("data: " + JSON.stringify({notInOurPortfolio: event.data.fetchPortfolio.notInOurPortfolio}) + "\n\n"));
            }
          }
          
          if (event.data.fetchAGM) {
            controller.enqueue(encoder.encode("data: " + JSON.stringify({fetchAGM: event.data.fetchAGM}) + "\n\n"));
          }
          
          if (event.data.result) {
            controller.enqueue(encoder.encode("data: " + JSON.stringify({result: event.data.result}) + "\n\n"));
          }
          
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