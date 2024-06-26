import { FC, useState } from "react"
import { copyToClipboard } from "../utils/copyToClipboard"

export type FetchedResultsContainerProps = {
  id: string
  results: unknown | null | undefined
  handleClearResults: () => void
}

export const FetchedResultsContainer: FC<FetchedResultsContainerProps> = ({
  id,
  results,
  handleClearResults: handleClear,
}) => {
  const [hidden, setHidden] = useState(false)

  return (
    <div className="flex flex-col items-center w-full gap-2">
      <div className="flex items-center justify-between w-full">
        <h3>Accessibility Results</h3>
        <div className="flex gap-2">
          <button onClick={handleClear}>Clear</button>
          <button onClick={() => copyToClipboard(id)}>Copy</button>
          <button onClick={() => setHidden(!hidden)}>{hidden ? "Show" : "Hide"}</button>
        </div>
      </div>
      {!hidden && <pre id={id}>{JSON.stringify(results, null, 2)}</pre>}
    </div>
  )
}
