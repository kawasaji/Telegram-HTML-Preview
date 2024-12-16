const vscode = require('vscode');

// Цвета для светлой темы
const lightThemeBg = '#ffffff'; // Фон окна
const lightQuoteBg = '#faeeed'; // Фон цитаты
const lightQuoteBorder = '#cc5049'; // Полоска слева от цитаты
const lightTextColor = '#000000'; // Черный текст

// Цвета для темной темы
const darkThemeBg = '#212121'; // Фон окна
const darkQuoteBg = '#332726'; // Фон цитаты
const darkQuoteBorder = '#cc5049'; // Полоска слева от цитаты
const darkTextColor = '#ffffff'; // Белый текст
const darkCodeTextColor = '#79a7ff'; // Синеватый цвет текста для <code>

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('telegramPreview.start', () => {
            const panel = vscode.window.createWebviewPanel(
                'telegramPreview',
                'Telegram HTML Preview',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                }
            );

            // Функция для обновления содержимого WebView
            const updateContent = () => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) return;

                const document = editor.document;
                const selection = editor.selection;
                const selectedText = document.getText(selection) || 'Выделите строку с текстом!';

                // Заменяем переносы строк на <br> для HTML
                const formattedText = selectedText
                    .replace(/\n/g, '<br>')  // Заменяем переносы строк на <br>
                    .replace(/<blockquote>(.*?)<\/blockquote>/g, '<blockquote class="telegram-quote">$1</blockquote>') // Поддержка блока цитаты
                    .replace(/<br><\/blockquote>/g, '</blockquote>'); // Убираем лишние <br> после </blockquote>

                panel.webview.postMessage({ command: 'update', text: formattedText });
            };

            // Слушаем изменение выделения текста
            vscode.window.onDidChangeTextEditorSelection(updateContent);

            // Инициализируем WebView
            panel.webview.html = getWebviewContent();

            // Слушаем сообщения из WebView (если нужно)
            panel.webview.onDidReceiveMessage((message) => {
                if (message.command === 'alert') {
                    vscode.window.showInformationMessage(message.text);
                }
            });
        })
    );
}

function getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Telegram HTML Preview</title>
        <style>
            body {
                font-family: Roboto, sans-serif;
                padding: 16px;
                background-color: #181818; /* Общий фон */
                color: #fff;
            }

            .telegram-message {
                border-radius: 8px;
                padding: 12px; /* Уменьшенные отступы */
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                margin: auto;
            }

            .telegram-message b {
                font-weight: bold;
            }

            .telegram-message code {
                padding: 0;
                border-radius: 0;
            }

            /* Белая тема для <code> */
            .light code {
                color: ${lightTextColor}; /* Обычный текст */
                background: none; /* Убираем фон */
            }

            /* Темная тема для <code> */
            .dark code {
                color: ${darkCodeTextColor}; /* Синеватый текст */
                background: none; /* Убираем фон */
            }

            /* Стиль для цитат */
            blockquote.telegram-quote {
                padding: 6px 14px; /* Уменьшили отступы внутри цитаты */
                margin: 6px 0 6px 0; /* Уменьшенный отступ сверху и снизу */
                font-style: italic;
                border-radius: 4px; /* Меньше округлости */
            }

            /* Светлая тема */
            .light .telegram-message {
                background-color: ${lightThemeBg};
                color: ${lightTextColor};
            }
            .light blockquote.telegram-quote {
                background-color: ${lightQuoteBg};
                border-left: 4px solid ${lightQuoteBorder}; /* Полоска чуть тоньше */
                color: ${lightTextColor};
                font-style: normal; /* Убираем курсив */
                margin-bottom: 0; /* Убираем лишний отступ снизу */
            }

            /* Темная тема */
            .dark .telegram-message {
                background-color: ${darkThemeBg};
                color: ${darkTextColor};
            }
            .dark blockquote.telegram-quote {
                background-color: ${darkQuoteBg};
                border-left: 4px solid ${darkQuoteBorder}; /* Полоска чуть тоньше */
                color: ${darkTextColor};
                font-style: normal; /* Убираем курсив */
                margin-bottom: 0; /* Убираем лишний отступ снизу */
            }

            /* Панели для разных тем, вертикальные */
            .panel {
                display: flex;
                justify-content: space-between;
                flex-direction: column;
            }

            .panel > div {
                width: 100%;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="panel">
            <div class="light">
                <div id="light-content" class="telegram-message">
                    Выделите строку в Python, чтобы увидеть превью!
                </div>
            </div>
            <div class="dark">
                <div id="dark-content" class="telegram-message">
                    Выделите строку в Python, чтобы увидеть превью!
                </div>
            </div>
        </div>

        <script>
            // Слушаем сообщения от расширения
            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'update') {
                    document.getElementById('light-content').innerHTML = message.text; // Обновляем HTML для светлой темы
                    document.getElementById('dark-content').innerHTML = message.text;  // Обновляем HTML для тёмной темы
                }
            });
        </script>
    </body>
    </html>`;
}

exports.activate = activate;