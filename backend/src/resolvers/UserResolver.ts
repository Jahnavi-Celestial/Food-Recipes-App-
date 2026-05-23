import { Resolver, Mutation, Arg } from "type-graphql";
import { User } from "../entity/User.ts";
import { AppDataSource } from "../config/db.ts";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";

@Resolver()
export class UserResolver {
  @Mutation(() => String)
  async register(
    @Arg("name", () => String) name: string,
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string,
  ) {
    try {
      const userRepo = AppDataSource.getRepository(User);

      const isEmailExist = await userRepo.findOne({ where: { email: email } });

      if (isEmailExist) {
        return "";
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = userRepo.create({
        name,
        email,
        password: hashedPassword,
      });
      await userRepo.save(newUser);

      return newUser.email;
    } catch (error: any) {
      console.log(error.message);
    }
  }

  @Mutation(() => String)
  async login(
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string,
  ) {
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { email: email } });

    if (!user) {
      return "";
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return "";
    }

    const token = jwt.sign(
      { userId: user.id },
      String(process.env.JWT_SECRET),
      { expiresIn: "24h" },
    );

    return token;
  }

  @Mutation(() => String)
  async googleLogin(
    @Arg("idToken", () => String) idToken: string,
  ): Promise<string> {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const clientId = process.env.GOOGLE_CLIENT_ID || "";

    const userRepo = AppDataSource.getRepository(User);

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified || !payload.email) {
      throw new Error("Invalid Google Account");
    }

    const { email, sub: google_id, name } = payload;

    let user = await userRepo.findOne({
      where: [{ email: email }, { google_id: google_id }],
    });

    if (!user) {
      user = await userRepo.create({ name: name || "user", email, google_id });
      await userRepo.save(user);
    } else if (!user.google_id) {
      user.google_id = google_id;
      await userRepo.save(user);
    }

    const token = jwt.sign(
      { userId: user.id },
      String(process.env.JWT_SECRET),
      { expiresIn: "24h" },
    );

    return token;
  }
}
