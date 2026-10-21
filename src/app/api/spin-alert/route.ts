import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prize = "អរគុណ (Thanks You)",
      prizeType = "thanks",
      isDoll = false,
      spinId = Math.random().toString(36).substring(2, 8).toUpperCase(),
      clientTime,
    } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Format current time in Phnom Penh / Indochina time
    const now = new Date();
    const formattedTime =
      clientTime ||
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Phnom_Penh",
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(now);

    const userAgent = req.headers.get("user-agent") || "Unknown Device";
    const isMobile = /mobile/i.test(userAgent) ? "📱 Mobile" : "💻 Desktop";

    // Build the Telegram notification message based on prizeType (no percentages shown)
    let emoji = "🎰 ព័ត៌មានលទ្ធផលបង្វិលកង";
    let statusText = `<b>លទ្ធផល:</b> ${prize}`;

    if (prizeType === "doll" || isDoll) {
      emoji = "🚨🎉🧸 MEGA JACKPOT WINNER! 🧸🎉🚨";
      statusText = `🔥 <b>អបអរសាទរ! ឈ្នះតុក្កតាមហាសំណាង (JACKPOT)!</b>`;
    } else if (prizeType === "sticker") {
      emoji = "✨🎨 STICKER WINNER! 🎨✨";
      statusText = `🎁 <b>អបអរសាទរ! ឈ្នះស្ទីគ័រដ៏ស្រស់ស្អាត (Sticker)!</b>`;
    } else if (prizeType === "candy") {
      emoji = "🍬🍭 SWEET CANDY WINNER! 🍭🍬";
      statusText = `🍭 <b>អបអរសាទរ! ឈ្នះស្ករគ្រាប់ផ្អែមឆ្ងាញ់ (Candy)!</b>`;
    } else if (prizeType === "like_page") {
      emoji = "👍🔄 LIKE PAGE & SPIN AGAIN! 🔄👍";
      statusText = `👍 <b>បាន Like Page និងបង្វិលម្ដងទៀត!</b>`;
    } else {
      emoji = "🙏😂 THANKS YOU 😂🙏";
      statusText = `😂 <b>លទ្ធផល:</b> អរគុណ (Thanks You)`;
    }

    const message = `
${emoji}
━━━━━━━━━━━━━━━━━━
🆔 <b>Spin ID:</b> <code>#SPIN-${spinId}</code>
🎁 <b>រង្វាន់:</b> <b>${prize}</b>
📊 <b>ស្ថានភាព:</b> ${statusText}
⏰ <b>ពេលវេលា:</b> <i>${formattedTime}</i>
📱 <b>ឧបករណ៍:</b> ${isMobile}
🌐 <b>គេហទំព័រ:</b> Sabay App
━━━━━━━━━━━━━━━━━━
`;

    // Check if Telegram environment variables are configured
    if (!botToken || !chatId) {
      console.warn(
        "Telegram Bot Token or Chat ID not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local"
      );
      return NextResponse.json({
        success: true,
        delivered: false,
        warning:
          "Telegram Bot Token or Chat ID not configured in .env.local. Alert logged locally.",
      });
    }

    // Send HTTP POST request to Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message.trim(),
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("Telegram API Error:", data);
      return NextResponse.json(
        {
          success: false,
          error: data.description || "Failed to send message to Telegram",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      delivered: true,
      messageId: data.result?.message_id,
    });
  } catch (error) {
    console.error("Spin Alert API Handler Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
