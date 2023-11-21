import { Layout } from "./layout";
import { Sidebar } from "./layout/Sidebar";

export default function App() {
    return (
        <div class="flex">
            <Sidebar />
            <Layout />
        </div>
    )
}