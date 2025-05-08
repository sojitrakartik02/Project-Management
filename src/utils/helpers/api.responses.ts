export const messages = {
    en: {
        General: {
            error: "Something went wrong",
            invalid: "Invalid ##",
            required: "## required",
            empty: "## is empty",
            does_not_match: "## does not %%",
            expired: "## Expired",
            permission: "Permission Denied",
            noFieldsProvided: "Required fields not provided",
            missing: "Missing ## Environment Variable",
            invalidEnum: "Invalid value for ##",
            add_success: "Successfully created ##",
            get_success: "Successfully fetched ##",
            get_all_success: "Successfully fetched all ##",
            update_success: "Successfully updated ##",
            delete_success: "Successfully deleted ##",
            errorCreating: "Error creating ##",
            errorFetching: "Error fetching ##",
            errorUpdating: "Error updating ##",
            errorDeleting: "Error deleting ##",
            already_exist: "## already exists",
            not_found: "## not found",
            image: "Image",
            sessionExpired: "Session has expired. Please log in again.",
            websiteURL: "website URL",

            profileImage: 'ProfileImage Id',
            Id: "id",
            Property: "field",

            rate_limit_exceeded: "Too many requests from this IP, please try again later.",
            refreshToken: "refreshToken"
        },

        User: {
            rate_limit_exceeded_Login: "Too many login attempts, please try again later",
            user: "User",
            emailOrpassword: "Invalid email or password. You have ## attempts remaining",

            YouCanNotUsePrevious: `You can't reuse your previous password`,
            email: "email",
            loginFailed: 'email or password',
            Ids: 'ids',
            succ_login: "Login successful",
            succ_logout: "Logout successful",
            auth_failed: "Authentication failed",
            otp: "OTP",
            OTP_sent_succ: "OTP sent successfully",
            otpAlreadySent: "Already Sent OTP",
            otpExpired: "OTP Expired",
            resentotp: "Resend OTP",
            verification_success: "Verification successful",
            password: "Password",
            reset_password: "Your password has been reset successfully",
            change_password: "Successfully changed ##",
            passwordInvalid: "Invalid password format",
            resetPassword: "Password must contain at least ##",
            passwordLength: "6 characters long",
            passwordUppercase: "one uppercase letter",
            passwordLowercase: "one lowercase letter",
            passwordNumber: "one digit",
            passwordSpecialChar: "one special character (@#$%^&*!.)",
            token: "Token",

            match: 'Match',
            AddressLine1: 'addressLine1',
            AddressLine2: 'addressLine2',
            city: 'city',
            state: 'state',
            zipcode: 'zipcode',

            userName: 'userName',
            fullName: 'fullName',

            adminLevel: 'adminLevel',
            admin: 'Admin',

            AccountLock: "Account locked. Please reset your password",

            userDelete: 'Cannot delete ## — User is currently added to projects.'
        },

        Role: {
            role: 'Role'
        },


        Notification: {
            notification: "Notification",
        },
        Project: {
            project: 'Project'
        }
    },
};






export const status = {
    OK: 200,
    Create: 201,
    BadRequest: 400,
    Unauthorized: 401,
    NotFound: 404,
    InternalServerError: 500,
    ResourceExist: 409,
    Forbidden: 403,
    TooManyRequests: 429
};

export const jsonStatus = {
    OK: 200,
    Create: 201,
    BadRequest: 400,
    Unauthorized: 401,
    NotFound: 404,
    InternalServerError: 500,
    ResourceExist: 409,
    Forbidden: 403,
    TooManyRequests: 429
};

