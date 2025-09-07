// Сервис для отправки сообщений в Telegram
const TELEGRAM_BOT_TOKEN = '7855695564:AAFTFpccBmiG3DXacfa6GjZZ_l_HbWxWsK4'
const TELEGRAM_CHAT_ID = '307734235'

interface TelegramMessage {
  chat_id: string
  text: string
  parse_mode?: 'HTML' | 'Markdown'
}

export const sendTelegramMessage = async (message: string): Promise<boolean> => {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const payload: TelegramMessage = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Ошибка отправки сообщения в Telegram:', response.status, response.statusText)
      return false
    }

    const result = await response.json()
    console.log('Сообщение успешно отправлено в Telegram:', result)
    return true
  } catch (error) {
    console.error('Ошибка при отправке сообщения в Telegram:', error)
    return false
  }
}

export const sendCodeNamesLayout = async (
  words: string[],
  colors: string[],
  cardId: number,
  width: number = 3,
  height: number = 3,
): Promise<boolean> => {
  console.log('=== TELEGRAM SEND ===')
  console.log('width:', width, 'height:', height)
  console.log('words:', words)
  console.log('colors:', colors)
  console.log('=====================')
  try {
    // Создаем сообщение с раскладкой Code Names
    let message = `🎯 <b>Code Names - Карточка ${cardId}</b>\n`
    message += `📐 <b>Размер поля: ${width}x${height}</b>\n\n`
    message += `📋 <b>Порядок цветов (слева направо, сверху вниз):</b>\n`

    // Группируем по строкам
    for (let row = 0; row < height; row++) {
      let rowText = ''
      for (let col = 0; col < width; col++) {
        const index = row * width + col
        const word = words[index] || '?'
        const color = colors[index] || '?'

        // Эмодзи для цветов
        const colorEmoji =
          color === 'red'
            ? '🔴'
            : color === 'blue'
              ? '🔵'
              : color === 'black'
                ? '⚫'
                : color === 'white'
                  ? '⚪'
                  : '❓'
        rowText += `${colorEmoji} ${word}  `
      }
      message += `${rowText.trim()}\n`
    }

    // Подсчитываем количество карточек каждого цвета
    const colorCounts = colors.reduce(
      (acc, color) => {
        acc[color] = (acc[color] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Добавляем визуальную карту из эмодзи
    message += `\n🗺️ <b>Визуальная карта:</b>\n`
    for (let row = 0; row < height; row++) {
      let rowText = ''
      for (let col = 0; col < width; col++) {
        const index = row * width + col
        const color = colors[index] || '?'

        // Эмодзи для визуальной карты
        const mapEmoji =
          color === 'red'
            ? '🔴'
            : color === 'blue'
              ? '🔵'
              : color === 'black'
                ? '⚫'
                : color === 'white'
                  ? '⚪'
                  : '❓'
        rowText += `${mapEmoji} `
      }
      message += `${rowText.trim()}\n`
    }

    message += `\n📝 <b>Легенда:</b>\n`
    if (colorCounts.red) message += `🔴 Красная команда (${colorCounts.red} карточек)\n`
    if (colorCounts.blue) message += `🔵 Синяя команда (${colorCounts.blue} карточек)\n`
    if (colorCounts.black)
      message += `⚫ Черная карточка (${colorCounts.black} карточка - проигрышная)\n`
    if (colorCounts.white) message += `⚪ Белая карточка (${colorCounts.white} карточка - ничья)\n`

    return await sendTelegramMessage(message)
  } catch (error) {
    console.error('Ошибка при создании сообщения Code Names:', error)
    return false
  }
}
