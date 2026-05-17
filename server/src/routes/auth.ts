import { Router, type IRouter, type Request, type Response } from "express";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { clearSession } from "../services/auth";

const router: IRouter = Router();

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

router.get("/logout", async (req: Request, res: Response) => {
  await clearSession(res);
  res.redirect("/");
});

export default router;

