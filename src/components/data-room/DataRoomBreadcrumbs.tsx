import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useCurrentFolderContext } from "@/contexts/CurrentFolderContext"
import { useDataRoomStore } from "@/store/dataRoomStore"

export function DataRoomBreadcrumbs() {
  const setCurrentFolderId = useDataRoomStore((state) => state.setCurrentFolderId)
  const { path } = useCurrentFolderContext()

  return (
    <Breadcrumb>
      <BreadcrumbList className="sm:text-base">
        <BreadcrumbItem>
          {path.length === 0 ? (
            <BreadcrumbPage>Workspace</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <button onClick={() => setCurrentFolderId(null)} type="button">
                Workspace
              </button>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {path.map((node, index) => (
          <React.Fragment key={node.id}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === path.length - 1 ? (
                <BreadcrumbPage>{node.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <button onClick={() => setCurrentFolderId(node.id)} type="button">
                    {node.name}
                  </button>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
