<template>
  <div id="share">
    <vue-particles
      color="#ffffff"
      :particleOpacity="0.7"
      :particlesNumber="50"
      shapeType="circle"
      :particleSize="3"
      linesColor="#E6E6FA"
      :linesWidth="1"
      :lineLinked="true"
      :lineOpacity="0.6"
      :linesDistance="150"
      :moveSpeed="6"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="push"
    ></vue-particles>

    <el-row class="head">
      <el-col :span="14">
        <el-container>
          <el-main class="head-logo"><span @click="jumpUrl('http://cloud.yongkj.cn/')">袖珍网盘吧</span></el-main>
        </el-container>
      </el-col>
      <el-col v-if="!error" :span="10">
        <el-container>
          <el-main class="head-col">
            <el-dropdown trigger="click">
              <span class="el-dropdown-link"><i style="color:white;" class="el-icon-more el-icon--right"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-tooltip class="item" effect="dark" :content="downloadTipsTwo" placement="top-start">
                  <el-dropdown-item icon="el-icon-download" @click.native="downloadMyFile()">下载文件</el-dropdown-item>
                </el-tooltip>
                <el-dropdown-item icon="el-icon-link" @click.native="copyLink()">复制链接</el-dropdown-item>
                <el-dropdown-item v-if="!flag" icon="el-icon-document" @click.native="copyName()">复制名称</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-main>
        </el-container>
      </el-col>
    </el-row>

    <el-container v-if="!error" class="userName-button">
      <el-button type="text" disabled style="margin: 0 auto;position: relative;z-index: 2;">共享者： {{ userName }}</el-button>
    </el-container>

    <el-row class="body" v-if="!error && judgeFileType(filename) !== 6" :style="flag ? 'width:70%;' : 'width:326px;'">
      <el-container v-show="judgeFileType(filename) === 3"><d-player ref="dplayer" :options="options" class="video"></d-player></el-container>
      <el-container v-if="judgeFileType(filename) === 2">
        <aplayer ref="aplayer" :audio="audio" :lrcType="0" :mini="false" :listFolded="true" :autoplay="false" style="width: 100%;" />
      </el-container>
      <el-container v-else-if="judgeFileType(filename) === 4">
        <el-image class="img-thumbnail" :src="resourceUrl" @click="pictureDisplay()"></el-image>
        <viewer :images="images" @inited="inited"><img v-for="item in images" :src="item.src" :key="item.index" height="100" v-show="false" /></viewer>
      </el-container>
      <el-container v-else-if="judgeFileType(filename) === 5">
        <mavon-editor ref="md" :style="isMD ? 'width: 100%;padding: 16px;' : 'width: 100%;'" v-html="text" :codeStyle="codeStyle" :ishljs="true" />
      </el-container>
    </el-row>

    <el-container v-if="judgeFileType(filename) === 6" class="document">
      <el-image style="margin: 0 auto;position: relative;z-index: 3;" class="img-thumbnail" src="http://m.yongkj.cn/document.svg" @click="pictureDisplay()"></el-image>
    </el-container>

    <el-container v-if="!error" class="download-button">
      <el-button v-if="flag" @click="downloadMyFile()" style="margin: 0 auto;position: relative;z-index: 2;" round type="primary" icon="el-icon-download">{{ downloadTipsTwo }}</el-button>
      <el-tooltip v-else class="item" effect="dark" :content="downloadTipsTwo" placement="bottom">
        <el-button @click="downloadMyFile()" style="margin: 0 auto;position: relative;z-index: 2;" round type="primary" icon="el-icon-download">{{ downloadTips }}</el-button>
      </el-tooltip>
    </el-container>

    <el-row class="body" v-if="error" :style="flag ? 'width:70%;' : 'width:326px;'">
      <el-image style="margin: 0 auto;position: relative;z-index: 3;width: 100%;" class="img-thumbnail" :src="require('../assets/error.gif')" @click="pictureDisplay()"></el-image>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'share',
  data() {
    return {
      baseHost: 'cloud.yongkj.cn',
      fileHost: 'file.yongkj.cn',
      filename: '',
      size: '',
      path: '',
      userName: '',
      userUUID: '',
      shareUrl: '',
      downloadUrl: '',
      resourceUrl: '',
      downloadTips: '',
      downloadTipsTwo: '',
      test: '',
      flag: true,
      options: {
        video: {
          url: ''
        }
      },
      audio: [],
      images: [],
      text: '',
      codeStyle: 'vs2015',
      error: false,
      first: true,
      isMD: false
    };
  },
  mounted() {
    if (this.isMobile()) {
      this.flag = false;
    }

    this.judgeFilePathUUID();
  },
  updated() {
    // this.error = true;
    // this.$nextTick(() => {
    //   this.error = false;
    // })
    if (this.judgeFileType(this.filename) == 2 && this.$refs.aplayer.currentMusic.url != this.resourceUrl) {
      this.$refs.aplayer.switch(0);

      clearTimeout(this.timer); //清除延迟执行
      this.timer = setTimeout(() => {
        //设置延迟执行
        this.$refs.aplayer.seek(0);
        this.$refs.aplayer.pause();
      }, 500);
    }

    // console.log(this.$refs.aplayer);
    // console.log(this.audio)
    // console.log(this.$refs.aplayer.currentMusic);
  },
  methods: {
    isMobile: function() {
      let flag = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      );
      return flag;
    },
    getUrlKey: function() {
      var url = window.location.href;
      if (url.indexOf('?') != -1) {
        var dz_url = url.split('#')[0];
        var cs_str = dz_url.split('?')[1];
        var cs_arr = cs_str.split('&');
        var cs = {};
        for (var i = 0; i < cs_arr.length; i++) {
          cs[cs_arr[i].split('=')[0]] = cs_arr[i].split('=')[1];
        }
        return cs.f;
      }
      return '';
    },
    judgeFilePathUUID: function() {
      var pathsUUID = this.getUrlKey();
      if (typeof pathsUUID == 'undefined') {
        this.error = true;
        this.$message({
          message: '无法获取共享文件！请检查文件共享链接是否正确！',
          type: 'error'
        });
      } else {
        if (pathsUUID == '') {
          this.error = true;
          this.$message({
            message: '无法获取共享文件！错误的文件共享链接！',
            type: 'error'
          });
        } else {
          this.$axios
            .post(
              'http://' + this.baseHost + '/pathsController/getFileInfo',
              this.$qs.stringify({
                pathsUUID: pathsUUID
              })
            )
            .then(response => {
              if (response.data.message == '') {
                this.userUUID = response.data.userDto.userUUID;
                this.userName = response.data.userDto.userName;

                this.filename = response.data.pathsDto.filename;
                this.size = response.data.pathsDto.size;
                this.path = response.data.pathsDto.path;

                this.shareUrl = 'http://' + this.baseHost + '/share.html?f=' + pathsUUID;
                this.downloadUrl = 'http://' + this.baseHost + '/pathsController/download?pathsUUID=' + pathsUUID;
                this.resourceUrl = encodeURIComponent('http://' + this.fileHost + '/fileSystem/' + this.userName + this.path);
                this.resourceUrl = this.resourceUrl.replace(/%3A/g, ':');
                this.resourceUrl = this.resourceUrl.replace(/%2F/g, '/');

                this.downloadTips = '下载 ' + this.getNameString(this.filename, 23) + ' (' + this.size.slice(0, this.size.length - 2) + ' ' + this.size.slice(this.size.length - 2, this.size.length) + ')';
                this.downloadTipsTwo = '下载 ' + this.filename + ' (' + this.size.slice(0, this.size.length - 2) + ' ' + this.size.slice(this.size.length - 2, this.size.length) + ')';

                if (this.judgeFileType(this.filename) == 3 && this.resourceUrl != '') {
                  this.$refs.dplayer.dp.switchVideo({ url: this.resourceUrl });
                } else if (this.judgeFileType(this.filename) == 2 && this.resourceUrl != '') {
                  var musicArray = [];
                  var cover = 'http://m.yongkj.cn/audio_default.png';
                  if (this.filename.indexOf('-') != -1) {
                    var names = this.filename.split('-');
                    var artist = names[0];
                    var musicNames = names[1].split('.');
                    var musicName = musicNames[0];
                    musicArray.push({ name: musicName, artist: artist, url: this.resourceUrl, cover: cover, lrc: '' });
                  } else {
                    musicNames = this.filename.split('.');
                    musicName = musicNames[0];
                    artist = '群星';
                    musicArray.push({ name: musicName, artist: artist, url: this.resourceUrl, cover: cover, lrc: '' });
                  }

                  this.audio = [];
                  this.audio = musicArray;
                } else if (this.judgeFileType(this.filename) == 4 && this.resourceUrl != '') {
                  var pictures = [];
                  pictures.push({ src: this.resourceUrl, index: 0 });
                  this.images = pictures;
                } else if (this.judgeFileType(this.filename) == 5 && this.resourceUrl != '') {
                  this.getText();
                }
                // clearTimeout(this.timer);  //清除延迟执行
                // this.timer = setTimeout(()=>{   //设置延迟执行
                //     this.$router.push({path: '/yun'});
                // },1500);
              } else {
                this.error = true;
                this.$message({
                  message: '共享文件获取失败！' + response.data.message,
                  type: 'error'
                });
              }
            })
            .catch(function(error) {
              console.log(error);
              this.$message({
                message: '共享文件获取失败！请检查网络！',
                type: 'error'
              });
            });
        }
      }
      // console.log(pathsUUID);
    },
    getNameString: function(str, len) {
      var strlen = 0;
      var s = '';
      for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 128) {
          strlen += 2;
        } else {
          strlen++;
        }
        s += str.charAt(i);
        
        if (strlen >= len) {
          return s + '...';
        }
      }
      return s;
    },
    downloadMyFile: function() {
      let ele = document.createElement('a');
      ele.download = this.filename;
      ele.href = this.downloadUrl;
      ele.style.display = 'none';
      document.body.appendChild(ele);
      ele.click();
      document.body.removeChild(ele);

      clearTimeout(this.timer); //清除延迟执行
      this.timer = setTimeout(() => {
        //设置延迟执行
        this.$message({
          type: 'success',
          message: '文件即将开始下载！'
        });
      }, 500);
    },
    test1: function() {
      this.$alert(
        'baseHost：' +
          this.baseHost +
          '\nflag:' +
          this.flag +
          '\nvideoWidth:' +
          this.videoWidth +
          '\nvideoHeight:' +
          this.videoHeight +
          '\nisMobile:' +
          this.isMobile() +
          '\nfilePathUUID:' +
          this.getUrlKey(),
        '信息',
        {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${action}`
            });
          }
        }
      );
    },
    copyLink: function() {
      this.$copyText(this.shareUrl).then(
        res => {
          // console.log(res)
          this.test = res.text;
          // this.$toast("已成功复制，可直接去粘贴");
          this.$message({
            type: 'success',
            message: '分享链接复制成功！'
          });
        },
        err => {
          console.log(err);
          // this.$toast("复制失败");
          this.$message({
            type: 'error',
            message: '分享链接复制失败！'
          });
        }
      );
    },
    copyName: function() {
      this.$copyText(this.filename).then(
        res => {
          // console.log(res)
          this.test = res.text;
          // this.$toast("已成功复制，可直接去粘贴");
          this.$message({
            type: 'success',
            message: '文件名称复制成功！'
          });
        },
        err => {
          console.log(err);
          // this.$toast("复制失败");
          this.$message({
            type: 'error',
            message: '文件名称复制失败！'
          });
        }
      );
    },
    judgeFileType: function(filename) {
      if (filename == '') {
        return 7;
      }

      if (filename.indexOf('/') != -1) {
        return 1;
      } else if (filename.toLowerCase().indexOf('.mp3') != -1) {
        return 2;
      } else if (
        filename
          .toLowerCase()
          .toLowerCase()
          .indexOf('.wav') != -1
      ) {
        return 2;
      } else if (filename.toLowerCase().indexOf('.flac') != -1) {
        return 2;
      } else if (filename.toLowerCase().indexOf('.mp4') != -1) {
        return 3;
      } else if (filename.toLowerCase().indexOf('.webm') != -1) {
        return 3;
      } else if (filename.toLowerCase().indexOf('.mkv') != -1) {
        return 3;
      } else if (filename.toLowerCase().indexOf('.jpg') != -1) {
        return 4;
      } else if (filename.toLowerCase().indexOf('.png') != -1) {
        return 4;
      } else if (filename.toLowerCase().indexOf('.jpeg') != -1) {
        return 4;
      }

      var text = [
        '.cpp',
        '.css',
        '.c',
        '.groovy',
        '.go',
        '.html',
        '.java',
        '.json',
        '.jsp',
        '.js',
        '.lua',
        '.makefile',
        '.md',
        '.txt',
        '.properties',
        '.perl',
        '.php',
        '.ps1',
        '.pyc',
        '.py',
        '.rb',
        '.sh',
        '.sql',
        '.ts',
        '.xml',
        '.vb',
        '.yaml'
      ];

      for (let i = 0; i < text.length; i++) {
        if (filename.toLowerCase().indexOf(text[i]) != -1) {
          return 5;
        }
      }

      return 6;
    },
    inited: function(viewer) {
      this.$viewer = viewer;
    },
    pictureDisplay: function() {
      this.$viewer.show();
    },
    getText: function() {
      this.$axios
        .post(
          'http://' + this.baseHost + '/pathsController/getText',
          this.$qs.stringify({
            userUUID: this.userUUID,
            pathsUUID: this.getUrlKey()
          })
        )
        .then(response => {
          this.text = this.getMarkdownText(response.data.textContent);
        })
        .catch(error => {
          console.log(error);
          this.$message({
            type: 'error',
            message: '获取文件内容失败！服务器内部错误！'
          });
        });
    },
    getMarkdownText: function(t) {
      var text = [
        '.cpp',
        '.css',
        '.c',
        '.groovy',
        '.go',
        '.html',
        '.java',
        '.json',
        '.jsp',
        '.js',
        '.lua',
        '.makefile',
        '.md',
        '.txt',
        '.properties',
        '.perl',
        '.php',
        '.ps1',
        '.pyc',
        '.py',
        '.rb',
        '.sh',
        '.sql',
        '.ts',
        '.xml',
        '.vb',
        '.yaml'
      ];

      var lang = [
        'c++',
        'css',
        'c',
        'groovy',
        'golang',
        'html',
        'java',
        'json',
        'jsp',
        'javascript',
        'lua',
        'makefile',
        'markdown',
        'plain_text',
        'properties',
        'perl',
        'php',
        'powershell',
        'python',
        'python',
        'ruby',
        'sh',
        'sql',
        'typescript',
        'xml',
        'vbscript',
        'yaml'
      ];

      for (let i = 0; i < text.length; i++) {
        if (this.filename.indexOf(text[i]) != -1) {
          if (lang[i] == 'markdown') {
            this.isMD = true;
            return this.$refs.md.markdownIt.render(t);
          } else {
            return this.$refs.md.markdownIt.render('```' + lang[i] + '\n' + t + '\n```');
          }
        }
      }
      return t;
    },
    jumpUrl: function(url) {
      // window.location.href = url;
      window.open(url, 'top');
    },
    onPlay: function() {
      if (this.first && this.$refs.aplayer.currentMusic.url != this.resourceUrl) {
        this.first = false;
        this.$refs.aplayer.switch(0);

        clearTimeout(this.timer); //清除延迟执行
        this.timer = setTimeout(() => {
          //设置延迟执行
          this.$refs.aplayer.seek(0);
          this.$refs.aplayer.pause();
        }, 500);
      }
    },
    imgAdd: function(fileName, fileObj) {
      console.log(fileName);
      console.log(fileObj);
    }
  }
};
</script>

<style>
@import '../assets/css/style.css';

#share {
  background: url('../assets/16_bg_noise_scale.jpg') no-repeat top;
  background-size: cover;
  background-attachment: fixed;
  height: 100%;
  width: 100%;
  position: fixed;
  overflow: scroll;
  z-index: -1;
}
.share-container {
  border-radius: 15px;
  background-clip: padding-box;
  margin: 90px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px rgba(155, 89, 182, 0.5);
  position: relative;
  z-index: 3;
}
#particles-js {
  position: fixed;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
  z-index: 1;
}

.head {
  margin: 0 auto;
  /*   border-bottom: 1px solid white; */
  /*   background: #3d4450; */
  background: #0082c9;
  position: relative;
  z-index: 3;
}
.head-logo {
  font-size: 18px;
  /*   margin-top: 3px; */
  /*   padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px; */
  /*     color: #9370DB; */
  /*     color: #20B2AA; */
  color: white;
  /*   color: #3d4450; */
  user-select: none;
  text-align: left;
}
.head-col {
  /*   padding-top: 20px;
  padding-bottom: 10px;
  padding-right: 10px; */
  /*     color: #337AB7; */
  margin-top: 1px;
  cursor: pointer;
  color: #409eff;
  text-align: right;
}
.body {
  margin: 0 auto;
  margin-top: 32px;
  margin-bottom: 45px;
  box-shadow: 0 0 25px rgba(155, 89, 182, 0.5);
  position: relative;
  z-index: 3;
}
.video {
  /*   left: 20px;
  top: 20px; */
  width: 100%;
  position: relative;
  z-index: 3;
}
.download-button {
  width: 100%;
  margin-bottom: 45px;
}
.userName-button {
  width: 100%;
  margin-top: 32px;
  margin-bottom: 32px;
}
.document {
  width: 100%;
  margin-bottom: 45px;
}
.img-thumbnail {
  display: inline-block;
  max-width: 100%;
  height: auto;
  padding: 4px;
  line-height: 1.42857143;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  -webkit-transition: all 0.2s ease-in-out;
  -o-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
}
.hljs::-webkit-scrollbar {
  display: block;
  height: 10px;
}
/*定义滑块颜色+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #3e3d42;
}

/*定义滚动条轨道内阴影+圆角*/
::-webkit-scrollbar-track {
  border-radius: 10px;
}
pre {
  background-color: #f6f8fa !important;
}
</style>
