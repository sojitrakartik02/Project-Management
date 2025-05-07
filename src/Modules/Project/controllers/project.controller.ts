import { ProjectService } from "@Project/services/project.service";
import Container from "typedi";

export class ProjectController {
    public projectService = Container.get(ProjectService)
}