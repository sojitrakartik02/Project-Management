import User from "@Auth/models/auth.model";
import { HttpException } from "@exceptions/httpException";
import { messages, status } from "@helpers/api.responses";
import { IProject } from "@Project/interfaces/project.interface";
import Project from "@Project/models/project.model";
import { Service } from "typedi";
import { AllowedRolesForPM } from "@Auth/interfaces/auth.interface";
@Service()
export class ProjectService {


    public async createProject(data: IProject, createdBy: string, language: string) {
        try {
            const projectManager = await User.findOne({
                _id: data.assignedProjectManager,
                isDeleted: false,
            }).populate('roleId');

            if (!projectManager) {
                throw new HttpException(
                    status.NotFound,
                    messages[language].General.not_found.replace('##', messages[language].User.user)
                );
            }

            const roleName = (projectManager.roleId as any).name;
            if (roleName !== 'Project Manager') {
                throw new HttpException(
                    status.BadRequest,
                    messages[language].General.invalid.replace('##', messages[language].Project.assignedProjectManager)
                );
            }

            if (data.assignedTeamMembers && data.assignedTeamMembers.length > 0) {
                const teamMembers = await User.find({
                    _id: { $in: data.assignedTeamMembers },
                    isDeleted: false,
                }).populate('roleId');

                if (teamMembers.length !== data.assignedTeamMembers.length) {
                    throw new HttpException(
                        status.NotFound,
                        messages[language].General.not_found.replace('##', messages[language].User.user)
                    );
                }


                const invalidTeamMember = teamMembers.find((member) => !AllowedRolesForPM.includes((member.roleId as any).name));
                if (invalidTeamMember) {
                    throw new HttpException(
                        status.BadRequest,
                        messages[language].General.invalid.replace('##', messages[language].User.user)
                    );
                }
            }
            if (!data.clients || data.clients.length === 0) {
                throw new HttpException(
                    status.BadRequest,
                    messages[language].General.invalid.replace('##', messages[language].Project.clients)
                );
            }

            const existingProject = await Project.findOne({
                name: data.name,
                isDeleted: false,
            });

            if (existingProject) {
                throw new HttpException(
                    status.ResourceExist,
                    messages[language].General.already_exist.replace('##', messages[language].Project.project)
                );
            }


            const project = await Project.create({
                name: data.name,
                description: data.description,
                status: data.status || 'Not Started',
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                assignedProjectManager: data.assignedProjectManager,
                assignedTeamMembers: data.assignedTeamMembers || [],
                createdBy,
                isDeleted: false,
                clients: data.clients,
            });

            return await Project.findById(project._id)
                .select('name description status startDate endDate clients assignedProjectManager assignedTeamMembers createdBy createdAt updatedAt')
                .populate('assignedProjectManager', '_id firstName lastName email')
                .populate('assignedTeamMembers', '_id firstName lastName email')
                .lean();
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                status.InternalServerError,
                messages[language].General.errorCreating.replace('##', messages[language].Project.project)
            );
        }
    }
}