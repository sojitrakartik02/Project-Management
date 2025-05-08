import { RoleRoute } from '@Role/routes/role.route'
import { App } from './app'
import { AuthRoute } from '@Auth/routes/auth.route'
import { userManagementRoutes } from '@userManagement/routes/userManagement.route'
import { ProjectRoutes } from '@Project/routes/project.route'

const app = new App([
    new RoleRoute(),
    new AuthRoute(),
    new userManagementRoutes(),
    new ProjectRoutes()
])


app.listen()   