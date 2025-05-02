import { RoleRoute } from '@Role/routes/role.route'
import { App } from './app'
import { AuthRoute } from '@Auth/routes/auth.route'

const app = new App([
new RoleRoute(),
new AuthRoute()
])


app.listen()   