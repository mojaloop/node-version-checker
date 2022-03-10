
export interface RepoNvmrcFileStatus{
    hasFile: boolean
    nodeVersion?: string
}

export interface DockerFileStatus{
    hasFile: boolean
    nodeVersion?: string
}

export class RepoItem {
    id: number = 0
    name: string = ""
    full_name: string = ""
    description: string = ""
    url: string = ""
    default_branch: string = ""
    created_at: Date = new Date()
    updated_at: Date = new Date()
    pushed_at: Date = new Date()
    topics: string[] = []

    // infered from files
    nvmrcStatus: RepoNvmrcFileStatus;
    dockerStatus: DockerFileStatus;

}
