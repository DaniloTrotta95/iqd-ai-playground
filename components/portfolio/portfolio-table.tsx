import { Topic, ClientWithPublisher, Publisher, PublisherWithClients } from "@/db/types";
import { getAllClients } from "@/actions/client.actions";
import PortfolioTableWithDialog from "./portfolio-table-with-dialog";
import { getPublishers } from "@/actions/publisher.actions";
import { getTopics } from "@/actions/topic.actions";

async function getData(): Promise<{ clients: ClientWithPublisher[], publishers: PublisherWithClients[], topics: Topic[] }> {
    const result = await getAllClients();
    const publishers = await getPublishers()
    const topics = await getTopics()

    if (!result.success || !result.data) {
        console.error("Failed to fetch clients:", result.error);
        return { clients: [], publishers: [], topics: [] };
    }

    if (!publishers.success || !publishers.data) {
        console.error("Failed to fetch publishers:", publishers.error);
        return { clients: [], publishers: [], topics: [] };
    }
    
    if (!topics.success || !topics.data) {
        console.error("Failed to fetch topics:", topics.error);
        return { clients: [], publishers: [], topics: [] };
    }
    
    return { clients: result.data, publishers: publishers.data, topics: topics.data };
}


export default async function PortfolioTable() {
    const { clients, publishers, topics } = await getData()
    
    return <PortfolioTableWithDialog initialData={clients} initialPublishers={publishers} initialTopics={topics} />
}