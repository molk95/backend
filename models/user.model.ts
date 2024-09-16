import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

// Email validation pattern
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// User Interface
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    };
    role: string;
    isVerified: boolean;
    courses: Array<{ courseId: string }>;

    // Compare password function to check hashed passwords
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Schema
const userSchema: Schema<IUser> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter a name"],
        },
        email: {
            type: String,
            required: [true, "Please enter a valid email"],
            validate: {
                validator: function (value: string) {
                    return emailRegexPattern.test(value);
                },
                message: "Please enter a valid email address",
            },
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Please enter your password"],
            minlength: [8, "Password must be at least 8 characters"],
        },
        avatar: {
            public_id: String,
            url: String,
        },
        role: {
            type: String,
            default: "user", // Default role set to 'user'
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        courses: [
            {
                courseId: {
                    type: String,
                },
            },
        ],
    },
    { timestamps: true }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
    const user = this;

    // Only hash the password if it's new or being modified
    if (!user.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const userModel: Model<IUser> = mongoose.model("User", userSchema);
export default userModel;
