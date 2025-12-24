import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter;
  private isConfigured = false;
  private smtpHost: string;

  constructor() {
    // Проверяем, настроен ли SMTP
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    this.smtpHost = process.env.SMTP_HOST || 'smtp.yandex.ru';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    
    // Отладочная информация
    this.logger.log(`🔍 Проверка SMTP настроек:`);
    this.logger.log(`   SMTP_HOST: ${this.smtpHost}`);
    this.logger.log(`   SMTP_PORT: ${smtpPort}`);
    this.logger.log(`   SMTP_USER: ${smtpUser ? 'установлен (' + smtpUser + ')' : 'не установлен'}`);
    this.logger.log(`   SMTP_PASS: ${smtpPass ? 'установлен (***)' : 'не установлен'}`);
    
    if (smtpUser && smtpPass && smtpUser !== 'your-email@gmail.com' && smtpPass !== 'your-app-password') {
      this.isConfigured = true;
      // Настройка для реального SMTP сервера
      // Для Yandex: порт 465 (SSL) или 587 (STARTTLS)
      // Для Gmail: порт 587 (STARTTLS) или 465 (SSL)
      const usePort = smtpPort || (this.smtpHost.includes('yandex') ? 465 : 587);
      const useSecure = usePort === 465;
      const isYandex = this.smtpHost.includes('yandex');
      
      this.transporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: usePort,
        secure: useSecure, // true для 465, false для 587 (STARTTLS)
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false, // Для разработки, в продакшене лучше true
          ciphers: isYandex ? undefined : 'SSLv3', // Yandex требует современные шифры
        },
        connectionTimeout: 10000, // 10 секунд таймаут
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });
      this.logger.log(`✅ SMTP настроен: ${this.smtpHost}:${usePort} (secure: ${useSecure})`);
    } else {
      // В режиме разработки это нормально - код выводится в консоль
      this.logger.warn('⚠️  SMTP не настроен. Коды верификации будут выводиться в консоль сервера.');
      if (!smtpUser || !smtpPass) {
        this.logger.warn('💡 Для настройки SMTP создайте файл backend/.env с настройками (см. EMAIL_VERIFICATION_SETUP.md)');
      } else {
        this.logger.warn('💡 Проверьте, что SMTP_USER и SMTP_PASS не являются значениями по умолчанию');
      }
      // Создаем фиктивный transporter для избежания ошибок
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 465,
        secure: false,
        auth: {
          user: 'dev',
          pass: 'dev',
        },
      });
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    // Всегда выводим код в консоль для удобства разработки
    this.logger.log(`\n${'='.repeat(60)}`);
    this.logger.log(`📧 КОД ВЕРИФИКАЦИИ ДЛЯ ${email.toUpperCase()}`);
    this.logger.log(`🔑 КОД: ${code}`);
    this.logger.log(`${'='.repeat(60)}\n`);

    // Если SMTP не настроен, просто возвращаемся (код уже выведен в консоль)
    if (!this.isConfigured) {
      // Код уже выведен в консоль выше, это нормально для режима разработки
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@algospec.com',
      to: email,
      subject: 'Код подтверждения AlgoSpec',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #141414;">Подтверждение email</h2>
          <p>Ваш код подтверждения:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #7D7D7D;">Этот код действителен в течение 10 минут.</p>
          <p style="color: #7D7D7D;">Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
        </div>
      `,
    };

    try {
      // Проверяем соединение перед отправкой
      await this.transporter.verify();
      this.logger.log(`✅ SMTP соединение проверено успешно`);
      
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email успешно отправлен на ${email}`);
      this.logger.debug(`Message ID: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`❌ Ошибка отправки email на ${email}`);
      this.logger.error(`Детали ошибки: ${error.message}`);
      if (error.response) {
        this.logger.error(`SMTP Response: ${error.response}`);
      }
      if (error.responseCode) {
        this.logger.error(`SMTP Response Code: ${error.responseCode}`);
        if (error.responseCode === 535) {
          this.logger.error(`⚠️  ОШИБКА АУТЕНТИФИКАЦИИ (535):`);
          const isYandex = this.smtpHost.includes('yandex');
          if (isYandex) {
            this.logger.error(`   - Убедитесь, что используется ПАРОЛЬ ПРИЛОЖЕНИЯ, а не обычный пароль Yandex`);
            this.logger.error(`   - Создайте пароль приложения: https://id.yandex.ru/security/app-passwords`);
            this.logger.error(`   - Включите двухфакторную аутентификацию в Яндекс аккаунте`);
          } else {
            this.logger.error(`   - Убедитесь, что используется ПАРОЛЬ ПРИЛОЖЕНИЯ, а не обычный пароль`);
            this.logger.error(`   - Для Gmail: https://myaccount.google.com/apppasswords`);
            this.logger.error(`   - Для Yandex: https://id.yandex.ru/security/app-passwords`);
            this.logger.error(`   - Включите двухфакторную аутентификацию`);
          }
          this.logger.error(`   - Проверьте, что SMTP_PASS в .env файле содержит правильный пароль приложения`);
        }
      }
      if (error.code) {
        this.logger.error(`Error Code: ${error.code}`);
        if (error.code === 'EAUTH') {
          this.logger.error(`⚠️  ОШИБКА АУТЕНТИФИКАЦИИ (EAUTH):`);
          this.logger.error(`   - Неверный email или пароль приложения`);
          this.logger.error(`   - Убедитесь, что SMTP_USER и SMTP_PASS в .env файле правильные`);
          this.logger.error(`   - Пароль приложения должен быть 16-символьным без пробелов`);
        } else if (error.code === 'ESOCKET') {
          this.logger.error(`⚠️  ОШИБКА СОЕДИНЕНИЯ (ESOCKET):`);
          this.logger.error(`   - Не удается подключиться к SMTP серверу`);
          this.logger.error(`   - Проверьте SMTP_HOST и SMTP_PORT в .env файле`);
          const isYandex = this.smtpHost.includes('yandex');
          if (isYandex) {
            this.logger.error(`   - Для Yandex попробуйте:`);
            this.logger.error(`     SMTP_PORT=465 (SSL) или SMTP_PORT=587 (STARTTLS)`);
            this.logger.error(`   - Убедитесь, что порт не заблокирован файрволом`);
          } else {
            this.logger.error(`   - Для Gmail используйте SMTP_PORT=587`);
            this.logger.error(`   - Убедитесь, что порт не заблокирован файрволом`);
          }
          this.logger.error(`   - Проверьте интернет соединение`);
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
          this.logger.error(`⚠️  ОШИБКА ТАЙМАУТА/ОТКЛОНЕНИЯ СОЕДИНЕНИЯ:`);
          this.logger.error(`   - Сервер не отвечает или недоступен`);
          this.logger.error(`   - Проверьте правильность SMTP_HOST`);
          this.logger.error(`   - Проверьте интернет соединение`);
        }
      }
      // Не выбрасываем ошибку, код уже выведен в консоль
      // Это позволяет продолжать работу даже если SMTP не работает
      this.logger.warn('Код доступен в консоли выше. Email не отправлен.');
    }
  }
}
