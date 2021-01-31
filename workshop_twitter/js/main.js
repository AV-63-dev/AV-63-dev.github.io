class FetchData {
    getResourse = async url => {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('Ошибка: ' + res.status);
        }
        return res.json();
    }

    getPost = () => this.getResourse('./db/dataBase.json');
}

class Twitter {
    constructor({ user, listElem, modalElems, tweetElems, classDeleteTweet, classLikeTweet, sortElem, showUserPostElem, showLikedPostElem }) {
        const fetchData = new FetchData();
        this.user = user;
        this.tweets = new Posts();
        this.elements = {
            listElem: document.querySelector(listElem),
            sortElem: document.querySelector(sortElem),
            modal: modalElems,
            tweetElems,
            showUserPostElem: document.querySelector(showUserPostElem),
            showLikedPostElem: document.querySelector(showLikedPostElem),
        };
        this.class = {
            classDeleteTweet,
            classLikeTweet,
        };
        this.sortDate = true;

        fetchData.getPost().then(data => {
            data.forEach(this.tweets.addPost);
            this.showAllPost();
        });

        this.elements.modal.forEach(this.handlerModal, this);
        this.elements.tweetElems.forEach(this.addTweet, this);
        this.elements.listElem.addEventListener('click', this.handlerTweet);
        this.elements.sortElem.addEventListener('click', this.changeSort);
        this.elements.showUserPostElem.addEventListener('click', this.showUserPost);
        this.elements.showLikedPostElem.addEventListener('click', this.showLikedPost);
    }

    renderPosts(tweets) {
        this.elements.listElem.textContent = '';
        const sortPost = tweets.sort(this.sortFields());
        sortPost.forEach(({ id, userName, nickname, text, img, likes, liked, getDate }) => {
            this.elements.listElem.insertAdjacentHTML('beforeend', `
                <li>
                    <article class="tweet">
                        <div class="row">
                            <img class="avatar" src="images/${nickname}.jpg" alt="Аватар пользователя ${nickname}">
                            <div class="tweet__wrapper">
                                <header class="tweet__header">
                                    <h3 class="tweet-author">${userName}
                                        <span class="tweet-author__add tweet-author__nickname">@${nickname}</span>
                                        <time class="tweet-author__add tweet__date">${getDate()}</time>
                                    </h3>
                                    <button class="tweet__delete-button chest-icon" data-id="${id}"></button>
                                </header>
                                <div class="tweet-post">
                                    <p class="tweet-post__text">${text}</p>
                                    ${
                                        img ? 
                                        `<figure class="tweet-post__image">
                                            <img src="${img}" alt="Илюстрация из поста ${nickname}">
                                        </figure>` : 
                                        ''
                                    }
                                </div>
                            </div>
                        </div>
                        <footer>
                            <button class="tweet__like ${liked ? this.class.classLikeTweet.active : ''}" data-id="${id}">
                                ${likes}
                            </button>
                        </footer>
                    </article>
                </li>
            `);
        });
    }

    showUserPost = () => {
        const post = this.tweets.posts.filter(item => item.nickname === this.user.nickname);
        this.renderPosts(post)
    }

    showLikedPost = () => {
        const post = this.tweets.posts.filter(item => item.liked);
        this.renderPosts(post)
    }

    showAllPost() {
        this.renderPosts(this.tweets.posts);
    }

    handlerModal({ button, modal, overlay, close }) {
        const buttonElem = document.querySelector(button);
        const modalElem = document.querySelector(modal);
        const overlayElem = document.querySelector(overlay);
        const closeElem = document.querySelector(close);
        const openModal = () => {
            modalElem.style.display = 'block';
        }
        const closeModal = (elem, event) => {
            if (event.target === elem) {
                modalElem.style.display = 'none';
            }
        }
        buttonElem.addEventListener('click', openModal);
        closeElem.addEventListener('click', closeModal.bind(null, closeElem));
        overlayElem.addEventListener('click', closeModal.bind(null, overlayElem));

        this.handlerModal.closeModal = () => {
            modalElem.style.display = 'none';
        }
    }

    addTweet({ text, img, submit }) {
        const textElem = document.querySelector(text);
        const imgElem = document.querySelector(img);
        const submitElem = document.querySelector(submit);
        
        let imgUrl = "";
        let tempTextElem = textElem.innerHTML;

        submitElem.addEventListener('click', () => {
            this.tweets.addPost({
                ...this.user,
                text: textElem.innerHTML,
                img: imgUrl
            })
            this.showAllPost();
            this.handlerModal.closeModal();
            textElem.innerHTML = tempTextElem;
        });

        textElem.addEventListener('click', () => {
            if (textElem.innerHTML === tempTextElem) {
                textElem.innerHTML = '';
            }
        });

        imgElem.addEventListener('click', () => {
            imgUrl = prompt('Введите адрес картинки!');
        });
    }

    handlerTweet = event => {
        if (event.target.classList.contains(this.class.classDeleteTweet)) {
            this.tweets.deletePost(event.target.dataset.id);
            this.showAllPost();
        }

        if (event.target.classList.contains(this.class.classLikeTweet.like)) {
            this.tweets.likePost(event.target.dataset.id);
            this.showAllPost();
        }

    }

    changeSort = () => {
        this.sortDate = !this.sortDate;
        this.showAllPost();
    }

    sortFields() {
        if (this.sortDate) {
            return (a, b) => {
                const dateA = new Date(a.postDate);
                const dateB = new Date(b.postDate);
                return dateB - dateA;
            }
        } else {
            return (a, b) => b.likes - a.likes;
        }
    }
}

class Posts {
    constructor({ posts = [] } = {}) {
        this.posts = posts;
    }

    addPost = tweet => this.posts.unshift(new Post(tweet)); //post

    deletePost(id) {
        this.posts = this.posts.filter(item => item.id !== id);
    }

    likePost(id) {
        this.posts.forEach(item => {
            if (item.id === id) {
                item.changeLike();
            }
        });
    }
}

class Post {
    constructor({ id, userName, nickname, postDate, text, img, likes = 0 }) {
        this.id = id || this.generateId();
        this.userName = userName;
        this.nickname = nickname;
        this.postDate = postDate ? this.correctDate(postDate) : new Date();
        this.text = text;
        this.img = img;
        this.likes = likes;
        this.liked = false;
    }

    changeLike() {
        this.liked = !this.liked;
        if (this.liked) {
            this.likes++;
        } else {
            this.likes--;
        }
    }

    generateId() {
        return Math.random().toString(32).substring(2, 9) + (+new Date).toString(32);
    }

    getDate = () => {
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return this.postDate.toLocaleString('ru-RU', options);
    }

    correctDate(date) {
        if (isNaN(Date.parse(date))) { //new Date(date).parse
            //date = date.replace(/\./g, '/');
            date = date.replaceAll('.', '/');
        }
        return new Date(date);
    }
}

const twitter = new Twitter({
    listElem: ".tweet-list",
    user: {
        userName: "Brock",
        nickname: "brock",
    },
    modalElems: [
        {
            button: ".header__link_tweet",
            modal: ".modal",
            overlay: ".overlay",
            close: ".modal-close__btn",
        }
    ],
    tweetElems: [
        {
            text: ".modal .tweet-form__text",
            img: ".modal .tweet-img__btn",
            submit: ".modal .tweet-form__btn",
        },
        {
            text: ".tweet-form__text",
            img: ".tweet-img__btn",
            submit: ".tweet-form__btn",
        }
    ],
    classDeleteTweet: "tweet__delete-button",
    classLikeTweet: {
        like: "tweet__like",
        active: "tweet__like_active",
    },
    sortElem: ".header__link_sort",
    showUserPostElem: ".header__link_profile",
    showLikedPostElem: ".header__link_likes",
    
});