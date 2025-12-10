import bcrypt from 'bcrypt';
import { User } from '../models/user.model';

export const seedAdminUser = async () => {
    const adminEmail = "Admin@MyAdmin.co.id";
    const exist = await User.findOne({ where: { email: adminEmail } });
    if (exist){return "Admin user already exists"};

    const pass = await bcrypt.hash("admin",10);
    await User.create({
        name: "Admin",
        email: adminEmail,
        password: pass,
        role: "Admin"
    });
    return "Admin user created successfully";
}