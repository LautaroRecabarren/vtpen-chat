const pusher = new Pusher('d28760b60173a3e99d03', {
    cluster: 'us2',
    encrypted: true,
    authEndpoint: 'pusher/auth'
});

const app = new Vue({
    el: '#app',
    data: {
        theme: false,
        joined: false,
        username: '',
        members: '',
        newMessage: '',
        messages: [],
        time: '',
        status: '',
    },
    methods: {
        scrollToBottom() {
            let chatBox = document.getElementById("historyChat");
            setTimeout(() => {
                chatBox.scrollTop = chatBox.scrollHeight;
            }, 100);
        },
        joinChat() {
            axios.post('join-chat', {username: this.username})
                .then(response => {
                    // User has joined the chat
                    this.joined = true;
                    const channel = pusher.subscribe('Chat');
                    channel.bind('pusher:subscription_succeeded', (members) => {
                        this.members = channel.members;
                    });
                    // Listen for chat messages
                    this.listen()
                });
        },
        sendMessage() {
            let today = new Date();
            let h = today.getHours();
            let mi = today.getMinutes();
            let time = (h < 10 ? '0' + h : h) + ':' + (mi < 10 ? '0' + mi : mi);
            let Time = time.toString();
            let message = {
                username: this.username,
                time: Time,
                message: this.newMessage
            }
            // Clear input field
            this.newMessage = '';
            axios.post('/send-message', message)
        },
        listen() {
            const channel = pusher.subscribe('Chat');
            channel.bind('message_sent', (data) => {
                this.messages.push({
                    username: data.username,
                    time: data.time,
                    message: data.message
                });

            this.scrollToBottom();

            });
        },
    }
});
