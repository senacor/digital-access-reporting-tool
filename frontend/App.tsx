import { CreateAccessibilityReportForm } from "./forms/CreateAccessibilityReportForm"
import { CrawlWebsiteUrlsForm } from "./forms/CrawlWebsiteUrlsForm"

function App() {
  return (
    <div className="flex flex-col w-full gap-8">
      <h1>Digital Access Reporting Tool</h1>
      <CrawlWebsiteUrlsForm />
      <hr className="w-full border-gray-300" />
      <CreateAccessibilityReportForm />
    </div>
  )
}

export default App
