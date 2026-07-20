# video_generator.py

import os
import telegram
import remotion

from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# TODO: Configure your Telegram Bot Token
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN")

def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends explanation on how to use the bot."""
    update.message.reply_text("Olá! Sou o seu assistente de vídeo. Envie-me o link do seu site e eu criarei um vídeo para vender seus produtos.")

def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles user messages, extracts website URL, and initiates video creation."""
    user_message = update.message.text
    # Basic URL detection - can be improved with more robust regex or libraries
    if "http" in user_message:
        website_url = user_message.split("http", 1)[1].split(" ", 1)[0]  # Simple extraction
        if not website_url.startswith("http"):
            website_url = "http" + website_url
        
        context.bot.send_message(chat_id=update.effective_chat.id, text=f"Entendido! Começando a criar um vídeo para {website_url}...")
        
        # Placeholder for video creation process
        # In a real scenario, this would involve calling Remotion or other tools
        video_path = create_product_video(website_url)
        
        if video_path:
            send_video_to_telegram(update, context, video_path)
        else:
            update.message.reply_text("Desculpe, não consegui criar o vídeo. Por favor, tente novamente mais tarde.")
    else:
        update.message.reply_text("Por favor, envie o link do site para que eu possa criar o vídeo.")

def create_product_video(website_url: str) -> str | None:
    """Creates a product video using Remotion. Placeholder function."""
    print(f"Simulating video creation for: {website_url}")
    # In a real implementation, you would use Remotion here:
    # try:
    #     remotion.render(
    #         component_path=os.path.abspath("path/to/your/Main.tsx"),
    #         output_path=os.path.abspath("output.mp4"),
    #         # Add other Remotion configurations as needed (props, fps, etc.)
    #     )
    #     return os.path.abspath("output.mp4")
    # except Exception as e:
    #     print(f"Error creating video: {e}")
    #     return None
    
    # For now, returning a dummy path to simulate success
    return "dummy_video.mp4"

def send_video_to_telegram(update: Update, context: ContextTypes.DEFAULT_TYPE, video_path: str) -> None:
    """Sends the created video to the user via Telegram."""
    try:
        with open(video_path, 'rb') as video_file:
            context.bot.send_video(chat_id=update.effective_chat.id, video=video_file, caption='Aqui está o seu vídeo!')
            print(f"Video sent successfully to {update.effective_chat.id}")
    except FileNotFoundError:
        update.message.reply_text(f"Erro: O arquivo de vídeo '{video_path}' não foi encontrado.")
        print(f"Error: Video file not found at {video_path}")
    except Exception as e:
        update.message.reply_text(f"Erro ao enviar o vídeo: {e}")
        print(f"Error sending video: {e}")

def main() -> None:
    """Start the bot."""
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Register handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # Run the bot until the user presses Ctrl-C
    print("Bot started. Press Ctrl+C to stop.")
    application.run_polling()

if __name__ == '__main__':
    main()
