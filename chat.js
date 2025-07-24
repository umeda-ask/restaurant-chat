'use strict';

// 対話フロー定義
const chatList = {
    1: {text: 'お問い合わせチャットへようこそ。', continue: true, option: 'normal', return: false},
    2: {text: {title: '以下よりお問い合わせ内容を選んでください。', choices: ['アクセス', '営業時間', '来店予約', '料金', 'お問い合わせ']}, continue: false, option: 'choices', return: true},
    3: {text: '小田急線 本厚木駅から徒歩３分になります。', continue: false, option: 'normal', return: true},
    4: {text: '弊所の営業時間は９：００～１７：００です。', continue: false, option: 'normal', return: true},
    5: {text: {title:'予約希望日時を選択して送信ボタンを押してください。'}, continue: false, option: 'calendar', return: true},
    // 5: {text: '会社設立、節税対策、確定申告、相続税等のご相談に対応しております。ぜひお気軽にお問い合わせください。', continue: false, option: 'normal', return: true},
    6: {text: 'コース料理は以下をご用意しております \n 3,500円／全4品 \n 4,500円／全5品 \n 6,500円／全6品', continue: false, option: 'normal', return: true},
    7: {text: {title: 'お問い合わせ内容を選択してください。', choices: ['取材/営業', 'その他']}, continue: false, option: 'choices', return: true},
    8: {text: 'お名前を入力して送信ボタンを押してください', continue: false, option: 'normal', return: false},
    9: {text: 'お電話番号を入力して送信ボタンを押してください。', continue: false, option: 'normal', return: false},
    10: {text: 'ご住所を入力して送信ボタンを押してください。', continue: false, option: 'normal', return: false},
    11: {text: 'お問い合わせ内容を入力して送信ボタンを押してください。', continue: false, option: 'normal', return: false},
    12: {text: {title: '相談を送信しますか？', choices: ['はい', '入力しなおす']}, continue: false, option: 'choices', return: false},
    13: {text: 'ご利用ありがとうございました。', continue: false, option: 'normal', return: true},
    14: {text: 'もう一度相談内容を入力してください。', continue: false, option: 'normal', return: false}
};

let userCount = 0;
let robotCount = 0;
let calendarCount;
let userData = [];
let userName = '', userAddress = '', userPhone = '', userInquiry = '', userAppointment = ''

let appointmentFlag = false
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://umeda-ask.github.io/restaurant-chat/styles.css';
document.head.appendChild(link);

const css = document.createElement('link')
css.rel = 'stylesheet';
css.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
document.head.appendChild(css)

const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
script.onload = function () {
    const localization = document.createElement('script');
    localization.src = "https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js";
    localization.onload = function () {
    // ✅ 両方読み込まれたあとにflatpickrを初期化
    console.log("flatpickrと日本語ロケールが準備完了");
    // flatpickr(document.getElementById("calendar"), { locale: "ja", ... });
    };
    document.head.appendChild(localization);
};
document.head.appendChild(script);

const emailJs = document.createElement("script")
emailJs.src = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"
document.head.appendChild(emailJs)


document.addEventListener('DOMContentLoaded', () => {

  // --- チャットUIのHTMLを動的に挿入 ---
  const chatbotHTML = `
    <div id="chatbot" style="display:none;">
      <div id="chatbotHeader">
        <img src="https://umeda-ask.github.io/chat-sunpart/person_icon.png" alt="Person Icon" id="personIcon">
        <span>お問い合わせチャット</span>
        <span id="closeChatbot" style="cursor:pointer;">✖</span>
      </div>
      <div id="chatbotMessages">
        <ul id="chatbot-ul"></ul>
      </div>
      <div id="chatbotInput">
        <input type="text" id="messageInput" placeholder="メッセージを入力...">
        <button id="sendMessage">送信</button>
      </div>
    </div>
    <button id="openChatbot" title="お問い合わせはこちらから">
      <img src="https://umeda-ask.github.io/chat-sunpart/chat_open.png" alt="チャットアイコン" class="openIcon">
    </button>
  `;
  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    const openChatbotButton = document.getElementById('openChatbot');
    const closeChatbotButton = document.getElementById('closeChatbot');
    const sendMessageButton = document.getElementById('sendMessage');

    openChatbotButton.onclick = () => {
        const chatbot = document.getElementById('chatbot');
        chatbot.style.display = 'flex';
        setTimeout(() => chatbot.classList.add('show'), 10);
        setTimeout(() => openChatbotButton.classList.add('hide'), 200);
    };

    closeChatbotButton.onclick = () => {
        const chatbot = document.getElementById('chatbot');
        chatbot.classList.remove('show');
        setTimeout(() => {
            chatbot.style.display = 'none';
            openChatbotButton.classList.remove('hide');
        }, 200);
    };

    sendMessageButton.onclick = () => {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        if (!message) return;

        appendUserMessage(message);
        messageInput.value = '';

        userCount++;
        userData.push(message);

        if (robotCount === 8) userName = message;
        else if (robotCount === 9) userPhone = message;
        else if (robotCount === 10) userAddress = message;
        else if (robotCount === 11) userInquiry = message;
        else if (robotCount === 5) {
            userAppointment = message;
            appointmentFlag = true
        }
        robotOutput();
        scrollChatToBottom();
    };

    robotOutput();

    function appendUserMessage(text) {
        const ul = document.getElementById('chatbot-ul');
        const li = document.createElement('li');
        li.classList.add('right');
        const div = document.createElement('div');
        div.classList.add('chatbot-right');
        div.textContent = text;
        li.appendChild(div);
        ul.appendChild(li);
    }

    function robotOutput() {
        if (robotCount == 5 && appointmentFlag){
            robotCount = 8
        }
        else if(robotCount == 9 && appointmentFlag){
            robotCount = 12
            chatList[robotCount].text.title = "予約内容を送信しますか？"
        }
        else{
            robotCount++;
        }

        if (!chatList[robotCount]) return;

        const ul = document.getElementById('chatbot-ul');
        const li = document.createElement('li');
        li.classList.add('left');

        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('chatbot-left');
        loadingDiv.innerHTML = `<div class="loading"><span></span><span></span><span></span></div>`;
        li.appendChild(loadingDiv);
        ul.appendChild(li);
        scrollChatToBottom();

        setTimeout(() => {
            loadingDiv.remove();
            const div = document.createElement('div');
            div.classList.add('chatbot-left');
            li.appendChild(div);

            const chat = chatList[robotCount];
            if (chat.option === 'choices') {
                const title = document.createElement('div');
                title.classList.add('choice-title');
                title.textContent = chat.text.title;
                div.appendChild(title);

                chat.text.choices.forEach((choice, i) => {
                    const btn = document.createElement('button');
                    btn.classList.add('choice-button');
                    btn.textContent = choice;
                    btn.id = `choice-${robotCount}-${i}`;
                    btn.onclick = () => pushChoice(btn);
                    div.appendChild(btn);
                });

                sendMessageButton.disabled = true;
            } else if (chat.option === 'normal') {
                div.innerHTML = chat.text.replace(/\n/g, '<br>');
                sendMessageButton.disabled = false;

                if (chat.return) {
                    const backBtn = document.createElement('button');
                    backBtn.classList.add('choice-button');
                    backBtn.textContent = '最初に戻る';
                    backBtn.onclick = () => {
                        robotCount = 1;
                        userCount = 0;
                        userData = [];
                        robotOutput();
                    };
                    div.appendChild(backBtn);
                }
            } else if(chat.option == 'calendar'){
                const oldInput = document.getElementById("calendar")
                if (oldInput && oldInput._flatpickr){
                    oldInput._flatpickr.destroy();
                    oldInput.remove(); 
                }
                const title = document.createElement("div");
                title.classList.add("choice-title");
                title.textContent = chat.text.title;
                div.appendChild(title)

                let input = document.createElement("input")
                input.setAttribute("type", "text")
                input.setAttribute("id", "calendar")
                input.setAttribute("data-input", "")
                div.appendChild(input)
                let calendar = document.getElementById("calendar")
                const messageInput = document.getElementById("messageInput")

                const instance = flatpickr(calendar, {
                    altInput: true,
                    altFormat: "Y年m月d日 H:i",
                    inline: true,
                    locale: "ja",
                    dateFormat: "Y年m月d日 H:i",
                    minDate: "today",
                    enableTime: true,
                    onChange: function(selectedDates, dateStr) {
                        messageInput.value = dateStr
                        ;}
                    });
                    instance.altInput.style.display = "none";
                    sendMessageButton.disabled = false;
                    }
                    
            scrollChatToBottom();

            if (chat.continue) robotOutput();
        }, 1500);
    }

    function pushChoice(btn) {
        userCount++;
        userData.push(btn.textContent);
        const btnId = btn.id;
        const parts = btnId.split('-');
        const rCount = parseInt(parts[1], 10);
        const choiceIndex = parseInt(parts[2], 10);

        // disable all other buttons in current choice group
        const buttons = document.querySelectorAll(`#chatbot-ul .choice-button`);
        buttons.forEach(b => {
            if (b !== btn) {
                b.disabled = true;
                b.classList.add('choice-button-disabled');
            }
        });

        btn.disabled = true;
        btn.classList.remove('choice-button-disabled');

        let nextCount;
        if (rCount === 12 && choiceIndex === 0) { // はい
            sendEmail();
            nextCount = 12;
        } else if (rCount === 12 && choiceIndex === 1) { // 入力しなおす
            if (appointmentFlag){
                nextCount = 4;
            }
            else {
                nextCount = 6;
            }
        } else if (rCount === 2) {
            switch (choiceIndex) {
                // robotOutputでカウントを+1するロジックがある為、nextCountは-1で記載
                case 0: nextCount = 2; break;
                case 1: nextCount = 3; break;
                case 2: nextCount = 4; break;
                case 3: nextCount = 5; break;
                case 4: nextCount = 6; break;
                default: nextCount = 13;
            }
        } else if (rCount === 7) {
            // robotOutputでカウントを+1するロジックがある為、nextCountは-1で記載
            nextCount = 7;
        } else {
            nextCount = 14;
        }

        robotCount = nextCount;
        robotOutput();
    }

    function sendEmail() {
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS is not loaded.');
            return;
        }
        emailjs.init("PUBLIC_KEY");
        if (!appointmentFlag){
            emailjs.send("askchatmail", "template_we6g9zk", {
            professional_office: "テスト飲食店",
            user_name: userName,
            user_address: userAddress,
            user_phone: userPhone,
            user_inquiry: userInquiry,
            professional_email: "zibo640@fuwamofu.com"
            }).then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            }, function(error) {
                console.log('FAILED...', error);
            });
        } else {
            emailjs.send("askchatmail", "template_ng1b5qp", {
                professional_office: "テスト飲食店",
                user_name: userName,
                user_phone: userPhone,
                user_appointment: userAppointment,
                professional_email: "zibo640@fuwamofu.com"
            }).then(function(response) {
                appointmentFlag = false;
                console.log('SUCCESS!', response.status, response.text);
            }, function(error) {
                console.log('FAILED...', error);
            });
        }
    }

    function scrollChatToBottom() {
        const chat = document.getElementById('chatbotMessages');
        chat.scrollTop = chat.scrollHeight;
    }
});
