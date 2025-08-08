import { ProductWithSpecs } from "@/db/types";
import { getTechSpecs } from "@/actions/techspec.actions";
import TechSpecTableWithDialog from "./techspec-table-with-dialog";

async function getData(): Promise<{ techSpecs: ProductWithSpecs[] }> {
    const result = await getTechSpecs();

    if (!result.success || !result.data) {
        console.error("Failed to fetch products:", result.error);
        return { techSpecs: [] };
    }

    return { techSpecs: result.data };
}


export default async function TechSpecTable() {
    const { techSpecs } = await getData()
    
    return <TechSpecTableWithDialog initialData={techSpecs} />
}