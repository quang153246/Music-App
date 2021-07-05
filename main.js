
const $=document.querySelector.bind(document);
const $$=document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const playlist = $('.playlist')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn =$('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')

const app={
    currentIndex: 0,
    isRepeat: false,
    isPlaying: false,
    isRamdom: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
          name: "Bệnh của anh",
          singer: "Khói",
          path: "./assets/music/music1.mp3",
          image: "./assets/img/anh2.jpg",
        },
        {
          name: "Đường tôi chở em về",
          singer: "Bùi Trường Linh",
          path: "./assets/music/music2.mp3",
          image:"./assets/img/anh1.jpg",
        },
        {
            name: "Let me down slowly",
            singer: "Bùi Trường Linh",
            path: "./assets/music/music3.mp3",
            image:"./assets/img/anh3.jpg",
        },
        {
            name: "Senorita",
            singer: "Shawn Mendes, Camila Cabello",
            path: "./assets/music/music4.mp3",
            image:"./assets/img/anh4.jpg",
        },
        {
            name: "Hello",
            singer: "Adele",
            path: "./assets/music/music5.mp3",
            image:"./assets/img/anh5.jpg",
        },
        {
            name: "Nắm lấy tay anh",
            singer: "Tuấn Hưng",
            path: "./assets/music/music6.mp3",
            image:"./assets/img/anh6.jpg",
        },
        {
            name: "Anh thanh niên",
            singer: "HuyR",
            path: "./assets/music/music7.mp3",
            image:"./assets/img/anh7.jpg",
        },
        {
            name: "Đường tôi chở em về",
            singer: "Bùi Trường Linh",
            path: "./assets/music/music2.mp3",
            image:"./assets/img/anh1.jpg",
          },
    ],
    setconfig: function(key,value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    //Lấy dữ liệu giao diện
    render:function(){
        const htmls=this.songs.map((song, index)=>{
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
                    <div class="thumb" style="background-image: url('${song.image}');"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
             `
        })
        playList.innerHTML=htmls.join('')
    },

    defineProperties: function() {
        Object.defineProperty(this,'currentSong',{
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    //Xử lí sự kiện
    handleEvents: function() {
        const _this=this
        const cdWidth=cd.offsetWidth

        //CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        //Xử lí cuộn
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth/cdWidth
        }

        // //Xử lí khi click play
        playBtn.onclick = function(){
            if (_this.isPlaying){
                audio.pause()
            }else{
                audio.play()
            }
        }
        //Khi song được play
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        //Khi song được pause
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()

        }
        
        //Tiến độ bài hát
        audio.ontimeupdate = function(){
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime/audio.duration*100)
                progress.value = progressPercent
            }
        }
        //Tua bài
        progress.onchange = function(e){
            const seekTime = audio.duration * e.target.value / 100
            audio.currentTime = seekTime
        }
        //Khi next bài
        nextBtn.onclick = function(){
            if (_this.isRamdom){
                _this.playRandom()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            this.scrollToActiveSong()
        }
        //Khi prev bài
        prevBtn.onclick = function(){
            if (_this.isRamdom){
                _this.playRandom()
            }else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            this.scrollToActiveSong()
        }
        //Random bài hát
        randomBtn.onclick = function(e) {
            _this.isRamdom =! _this.isRamdom
            _this.setconfig('isRandom',_this.isRamdom)
            randomBtn.classList.toggle('active',_this.isRamdom)
        }
        //Lặp bài
        repeatBtn.onclick = function(e){
            _this.isRepeat = !_this.isRepeat
            _this.setconfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        //Xử lí khi audio ended
        audio.onended = function(){
            if (_this.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
        }
        // Xử lí khi click vào playlist
        playList.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')){
                //xử lí khi click vào song
                if (songNode){
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }
    },

    scrollToActiveSong: function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',

            })
        },300)
    },
    loadCurrentSong(){
        Headers.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

    }, 
    loadConfig: function(){
        this.isRamdom = this.config.isRamdom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function(){
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length){
            this.currentIndex=0
        }
        this.loadCurrentSong()

    },
    prevSong: function(){
        this.currentIndex--
        if (this.currentIndex < 0){
            this.currentIndex = this.songs.length-1
        }
        this.loadCurrentSong()
    },
    playRandom: function(){
        let newIndex
        do{
            newIndex = Math.floor(Math.random()*this.songs.length)
        }while(this ==this.currentIndex)
        this.currentIndex=newIndex
        this.loadCurrentSong()
    },

    start: function(){
        //load config
        this.loadConfig();
        //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe các sự kiện DOM Events
        this.handleEvents(); 

        //Tải thông tin bài hát đầu tiên vào UI
        this.loadCurrentSong();
        //Render playlist
        this.render();
    }
}

app.start();

