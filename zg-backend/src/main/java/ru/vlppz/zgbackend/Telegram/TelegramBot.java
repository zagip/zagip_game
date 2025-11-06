package ru.vlppz.zgbackend.Telegram;

import org.springframework.beans.factory.annotation.Autowired;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.webapp.WebAppInfo;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.ArrayList;
import java.util.List;

import ru.vlppz.zgbackend.DB.User.Role;
import ru.vlppz.zgbackend.DB.User.User;
import ru.vlppz.zgbackend.DB.User.UserRepository;
import ru.vlppz.zgbackend.Services.ReferralTrackingService;

public class TelegramBot extends TelegramLongPollingBot {

    private final String botToken;
    private final String botUsername;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ReferralTrackingService referralTrackingService;

    public TelegramBot(String botToken, String botUsername) {
        this.botToken = botToken;
        this.botUsername = botUsername;
    }


    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            long chatId = update.getMessage().getChatId();
            Long telegramUserId = update.getMessage().getFrom() != null ? update.getMessage().getFrom().getId() : null;
            String messageText = update.getMessage().getText();

            boolean isAdmin = false;
            if (telegramUserId != null) {
                isAdmin = userRepository.findByTelegramId(telegramUserId)
                        .map(User::getRole)
                        .map(role -> role == Role.ADMIN)
                        .orElse(false);
            }

            if (messageText.startsWith("/start") && telegramUserId != null) {
                handleStartCommand(messageText, telegramUserId);
            }

            sendWebAppKeyboard(chatId, isAdmin);
        }
    }

    private void handleStartCommand(String messageText, Long telegramUserId) {
        if (messageText.length() > 7) {
            String startParam = messageText.substring(7).trim();
            try {
                Long referrerTelegramId = Long.parseLong(startParam);
                
                if (userRepository.findByTelegramId(telegramUserId).isEmpty()) {
                    referralTrackingService.trackReferral(telegramUserId, referrerTelegramId);
                    System.out.println("Tracking referral: new user " + telegramUserId + " came via referral from " + referrerTelegramId);
                }
            } catch (NumberFormatException e) {
                System.out.println("Invalid referrer ID in start command: " + startParam);
            }
        }
    }

    private void sendWebAppKeyboard(long chatId, boolean includeAdminButton) {
        SendMessage message = new SendMessage();
        message.setChatId(String.valueOf(chatId));
        message.setText("Привет! Это Zagip.Game - самая интересная игра в мире");

        InlineKeyboardMarkup markupInline = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();
        List<InlineKeyboardButton> rowInline = new ArrayList<>();

        InlineKeyboardButton webAppButton = new InlineKeyboardButton();
        webAppButton.setText("Открыть");
        WebAppInfo webAppInfo = new WebAppInfo();
        webAppInfo.setUrl("https://test.vlppz.ru");
        webAppButton.setWebApp(webAppInfo);

        rowInline.add(webAppButton);
        if (includeAdminButton) {
            InlineKeyboardButton adminButton = new InlineKeyboardButton();
            adminButton.setText("Админка");
            WebAppInfo webAppInfoAdmin = new WebAppInfo();
            webAppInfoAdmin.setUrl("https://test.vlppz.ru/admin");
            adminButton.setWebApp(webAppInfoAdmin);
            rowInline.add(adminButton);
        }
        rowsInline.add(rowInline);
        markupInline.setKeyboard(rowsInline);

        message.setReplyMarkup(markupInline);

        try {
            execute(message);
        } catch (TelegramApiException e) {
            throw new RuntimeException("Error sending message", e);
        }
    }
}

