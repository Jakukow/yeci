import { NextResponse } from "next/server";

import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { connection, mint, payer } from "@/src/services/solana";

const AIRDROP_AMOUNT = 100 * 1_000_000;

export async function POST(req: Request) {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userPublicKey = new PublicKey(me);

    const userAta = getAssociatedTokenAddressSync(
      mint,
      userPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction();

    const info = await connection.getAccountInfo(userAta);
    if (!info) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          userAta,
          userPublicKey,
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }

    transaction.add(
      createMintToInstruction(
        mint,
        userAta,
        payer.publicKey,
        AIRDROP_AMOUNT,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      payer,
    ]);

    return NextResponse.json({ ok: true, signature, amount: AIRDROP_AMOUNT });
  } catch (e: any) {
    console.error("Faucet error:", e);
    return NextResponse.json(
      { error: e.message || "Faucet failed" },
      { status: 500 }
    );
  }
}
