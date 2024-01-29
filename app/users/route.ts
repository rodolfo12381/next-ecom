import { NextResponse } from "next/server"

export const GET = (req: Request) => {
    NextResponse.json({ok: true, from: "from api"});
}