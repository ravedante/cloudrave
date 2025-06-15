const BOT_TOKEN = "7884145285:AAGCJVcrUONcvbGR1dAL4_vM-_VPEI9Hzjg"; // insira seu token real

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!path.startsWith("/video/")) {
    return new Response("Use /video/NOME.mp4", { status: 400 });
  }

  const filename = decodeURIComponent(path.replace("/video/", ""));
  const dbUrl = "https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPO/main/db.json";

  try {
    const res = await fetch(dbUrl);
    const db = await res.json();

    if (!db[filename]) {
      return new Response("Vídeo não encontrado", { status: 404 });
    }

    const file_id = db[filename];

    // Obtem o caminho real do Telegram
    const tgFile = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file_id}`);
    const tgData = await tgFile.json();
    const file_path = tgData.result.file_path;

    const videoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file_path}`;
    const videoStream = await fetch(videoUrl);

    return new Response(videoStream.body, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `inline; filename="${filename}"`
      }
    });
  } catch (err) {
    return new Response("Erro: " + err.message, { status: 500 });
  }
}
