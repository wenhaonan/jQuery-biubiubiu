//不同模式的数据
let data = [{
  model: "easy",
  biuSpeed: 6,
  biuNum: 300,
  enemyNum: 350,
  enemySpeed: 2
}, {
  model: "dif",
  biuSpeed: 8,
  biuNum: 200,
  enemyNum: 300,
  enemySpeed: 3
},
{
  model: "hell",
  biuSpeed: 10,
  biuNum: 150,
  enemyNum: 250,
  enemySpeed: 4
}];

//用到的函数
const { floor, random, max, min } = Math;
//主战场
let $battleGround = $(".battle-ground"),
  $score = $('.score span'),
  battleGround = document.getElementsByClassName('battle-ground')[0],
  plane = document.getElementsByClassName('my-plane'),
  smallenemy = document.getElementsByClassName('enemy-small'),
  bigenemy = document.getElementsByClassName('enemy-big'),
  //战场左定位
  battleoffsetleft = $battleGround.offset().left,
  //视口的高
  battleheight = $('body').height(),
  biuPropDiv = document.getElementsByClassName("biu-prop");

let score = 0;
//子弹火力

//初始化
init()

//初始化界面函数
function init() {
  //打扫战场
  $battleGround.empty()
  let startGame = $("<div class='start-game'></div>")
  $battleGround.append(startGame)
  //历史记录分数
  $('.most-score span').text(localStorage.getItem("historyScore") ? localStorage.getItem("historyScore") : "无历史最高分")

  startGame.on('click', modelChoice)
}

function modelChoice() {
  $battleGround.empty()
  let $easy = $("<div class='model'>简单模式</div>"),
    $diff = $("<div class='model'>困难模式</div>"),
    $hell = $("<div class='model'>地狱模式</div>");
  $battleGround.append($easy, $diff, $hell)
  $battleGround.css('background', 'url(./img/bg.jpg) 100% 100% no-repeat')

  //选择模式
  $('.model').on("click", function (e) {
    //获取选择难度
    let model = $(this).index('.model')
    gameStart(model, e)
    model = null
  })
}

//页面跳转
function gameStart(model, e) {
  $battleGround.empty()
  $battleGround.css("background", `url(./img/bg${model}.jpg) 100% 100% no-repeat`)
  //背景音效
  let startAudio = document.createElement('audio')
  startAudio.autoplay = true
  startAudio.loop = true
  startAudio.volume = 0.5
  startAudio.className = 'startAudio'
  battleGround.appendChild(startAudio)
  startAudio.src = './img/game_music.mp3'
  //生成敌机, 我的战机, 子弹奖励, 
  creatmyPlane(model, e)
  creatEnmey(model)
  //参数为生成奖励间隔
  biuCountAndFire(5000)
}

//生成我方战机
function creatmyPlane(model, e) {
  let $plane = $("<div class='my-plane'></div>");
  $plane.css({
    backgroundImage: `url(./img/plane_${model}.png)`,
    left: e.clientX - battleoffsetleft - 42,
    top: e.clientY - 33,
    cursor: 'none'
  })
  $battleGround.append($plane)
  plane[0].count = 1;
  plane[0].fire = 1;
  //鼠标移动函数
  movePlane();
  //生成子弹
  creatBiu(model)
  $plane = null
}

//鼠标移动飞机
function movePlane() {
  //鼠标移动
  let left,
    top;
  //吃到奖励的音效
  let chidaole = document.createElement('audio');
  chidaole.autoplay = true;
  chidaole.volume = 1;
  battleGround.appendChild(chidaole)

  document.onmousemove = function (e) {
    if (plane.length == 0) return
    left = e.clientX - battleoffsetleft - 42;
    top = e.clientY - 33;
    left = max(left, -4)
    left = min(left, 394)
    top = max(top, 0)
    top = min(top, battleheight - 66)
    plane[0].style.left = left + 'px';
    plane[0].style.top = top + 'px'
    // if (plane[0].count >= 3 && plane[0].fire >= 3) {
    //   battleGround.removeChild(chidaole)
    //   chidaole = null;
    //   return
    // }
    if (biuPropDiv[0] && testCrash(biuPropDiv[0], plane[0])) {
      chidaole.src = './img/chidaoju.mp3'
      battleGround.removeChild(biuPropDiv[0])
      if (plane[0].a == 0) {
        plane[0].count++
        plane[0].count = min(3, plane[0].count)
      } else {
        plane[0].fire++
        plane[0].fire = min(3, plane[0].fire)
      }
    }
  }
}


/* 原生创建 */

//生成敌方战机
let enemyTimer = null;//敌机计时器
function creatEnmey(model) {
  let { enemyNum, enemySpeed } = data[model],
    //big飞机的概率
    bigPro = 4 - model;
  //敌机出现音效
  let overAudio = document.createElement('audio')
  overAudio.autoplay = true
  overAudio.loop = true
  overAudio.volume = 0.8
  overAudio.src = './img/enemy_out.mp3'
  overAudio.className = 'overAudio'
  battleGround.appendChild(overAudio)

  enemyTimer = setInterval(() => {
    if (plane.length == 0) return
    //难度不同, 生成大飞机的概率不同
    let left = randomNum(0, 406);
    let enemy = document.createElement('div');
    let blood = document.createElement('div');
    enemy.style.cssText = `top: ${-64}px;left: ${left}px`;
    left = null
    blood.className = 'blood';
    if ((randomNum(0, bigPro) == 0)) {
      enemy.className = 'enemy-big'
      enemy.blood = 3
    } else {
      enemy.className = 'enemy-small'
      enemy.blood = 2
    }
    enemy.appendChild(blood)
    battleGround.appendChild(enemy)
    blood = null

    enemyRun()
    function enemyRun() {
      enemy.style.top = enemy.offsetTop + enemySpeed + "px";
      if (enemy.offsetTop >= battleheight) {
        battleGround.removeChild(enemy);
        enemy = null
      } else {
        enemy.run = requestAnimationFrame(enemyRun)
        if (testCrash(enemy, plane[0])) {
          cancelAnimationFrame(enemy.run)
          overAudio.src = "./img/game_over.mp3";
          //敌机爆炸
          boom(enemy, true)
          //我方爆炸, 游戏结束
          boom(plane[0], true, gameOver)
        }
      }
    }
  }, enemyNum);
}

//生成子弹
//子弹计时器
let biuTimer = null;
function creatBiu(model) {
  let { biuNum, biuSpeed } = data[model];

  biuTimer = setInterval(() => {
    //如果坠机
    if (plane.length == 0) return
    //有几个子弹就生成几个
    for (let i = 0; i < plane[0].count; i++) {
      creat(i)
    }

    function creat(i) {
      let biu = document.createElement('div');
      biu.style.top = `${plane[0].offsetTop - 30}px`
      //根据子弹数量动态改变子弹的位置
      if (plane[0].count == 1) {
        biu.style.left = `${plane[0].offsetLeft + 27}px`
      } else if (plane[0].count == 2) {
        biu.style.left = [`${plane[0].offsetLeft + 52}px`, `${plane[0].offsetLeft + 2}px`][i]
      } else {
        biu.style.left = [`${plane[0].offsetLeft + 2}px`, `${plane[0].offsetLeft + 27}px`, `${plane[0].offsetLeft + 52}px`][i]
      }
      biu.className = 'biu-biu'
      //子弹威力
      biu.fire = plane[0].fire
      battleGround.appendChild(biu)

      biuRun()
      function biuRun() {
        //子弹消失
        if (!biu) return
        biu.style.top = biu.offsetTop - biuSpeed + "px";
        if (biu.offsetTop < 0) {
          $(biu).remove()
        } else {
          biu.run = requestAnimationFrame(biuRun)
          //小飞机碰撞检测
          for (let i = 0; i < smallenemy.length; i++) {
            if (testCrash(smallenemy[i], biu)) {
              $(biu).remove()
              smallenemy[i].blood -= biu.fire;
              //血条消失术
              smallenemy[i].firstElementChild.style.backgroundSize = `${(smallenemy[i].blood * 50)}% 100%`
              //飞机没血了
              if (smallenemy[i].blood <= 0) {
                cancelAnimationFrame(biu.run)
                boom(smallenemy[i])
                score += 5000;
                $score.text(score)
              }
            }
          }
          //大飞机碰撞检测
          for (let i = 0; i < bigenemy.length; i++) {
            if (testCrash(bigenemy[i], biu)) {
              $(biu).remove()
              bigenemy[i].blood -= biu.fire;
              //血条消失术
              bigenemy[i].firstElementChild.style.backgroundSize = `${(bigenemy[i].blood * 33)}% 100%`
              if (bigenemy[i].blood <= 0) {
                boom(bigenemy[i], true)
                cancelAnimationFrame(biu.run)
                score += 10000;
                $score.text(score)
              }
            }
          }
        }
      }
    }
  }, biuNum);
}

//原生检测
function testCrash(a, b) {
  if (!a || !b) return
  var aTop = a.offsetTop,
    aLeft = a.offsetLeft,
    aRight = aLeft + a.offsetWidth,
    aBottom = aTop + a.offsetHeight,
    bTop = b.offsetTop,
    bLeft = b.offsetLeft,
    bRight = bLeft + b.offsetWidth,
    bBottom = bTop + b.offsetHeight;
  let bol = !(aTop > bBottom || aLeft > bRight || aBottom < bTop || aRight < bLeft);
  aTop = aLeft = aRight = aBottom = bTop = bLeft = bRight = bBottom = null;
  return bol
}

//子弹奖励生成函数
let biuCountAndFireTimer = null;

function biuCountAndFire(time) {
  biuCountAndFireTimer = setInterval(() => {
    //上限为3个
    if (plane[0].count >= 3 && plane[0].fire >= 3) {
      clearInterval(biuCountAndFireTimer)
      return
    }
    let biuProp = $("<div class='biu-prop'></div>");
    if ((randomNum(1, 2) == 1)) {
      bgI = 'url(./img/biucount.png)'
      //0是加子弹
      plane[0].a = 0
    } else {
      bgI = 'url(./img/biufire.png)'
      plane[0].a = 1
    }
    biuProp.css({
      top: randomNum(0, battleheight - 55),
      left: randomNum(0, 419),
      backgroundImage: bgI
    })
    $battleGround.append(biuProp)
    setTimeout(() => {
      biuProp.remove()
      biuProp = null
    }, 2000);
  }, time);
}

//爆炸函数  true是bigboom
function boom(enemy, bol, fn) {
  //如果有传gameover 先清空定时器, 以免出错
  if (fn) {
    clearInterval(enemyTimer)
    clearInterval(biuTimer)
    clearInterval(biuCountAndFireTimer)
  }
  //原生dom转jq对象
  let $enemy = $(enemy)
  let pos = $enemy.position();
  let left = pos.left,
    top = pos.top;
  $enemy.remove()
  $enemy = null
  let boom = bol ? $("<div class='boom-big'></div>") : $("<div class='boom-small'></div>")
  boom.css({
    left,
    top
  })
  $battleGround.append(boom)
  boom.fadeOut(1000, function () {
    this.remove()
    pos = left = top = boom = null
    fn && fn()
  })
}

//游戏结束
function gameOver() {
  //清除定时器
  clearInterval(enemyTimer)
  clearInterval(biuTimer)
  clearInterval(biuCountAndFireTimer)

  //清理战场
  $battleGround.empty()
  //重新开始
  oneMore()
  //记录分数
  if (score > localStorage.getItem("historyScore")) {
    localStorage.setItem("historyScore", `${score}`)
    $('.most-score span').text(score)
    score = 0
  }
}

//再来一局
function oneMore() {
  $battleGround.css("background", "url(./img/over.jpg) 100% 100% no-repeat")
  let $more = $("<div class='more'></div>")
  let $lastscore = $('<div class="last-score"><div>')
  $lastscore.text(score)
  $battleGround.append($more, $lastscore)
  $lastscore = null
  $more.on('click', modelChoice)
}

//esc退出
$(document).on('keydown', function (e) {
  if (e.keyCode != 27) return
  if (plane.length == 0) return
  $('.overAudio').attr('src', "./img/game_over.mp3");
  boom(plane[0], true, gameOver)
})

//只有视口大小
window.onresize = () => {
  battleoffsetleft = $battleGround.offset().left;
  battleheight = $('body').height();
}

//随机数
function randomNum(a, b) {
  let val = Math.floor(Math.random() * (b + 1 - a) + a);
  return val;
}

/* jquery方法 */
//生成子弹
//子弹计时器
// let biuTimer = null;
// function creatBiu(model) {
//   let $myplane = $('.my-plane'),
//     biuX,
//     biuY;
//   let { biuSpeed, biuNum } = data[model];
//   biuTimer = setInterval(() => {
//     biuX = $myplane.position().left + 2;
//     biuY = $myplane.position().top - 30;
//     let biu = $("<span class='biu-biu'></span>"),
//       biu2 = biu.clone()
//     $battleGround.append(biu)
//     $battleGround.append(biu2)
//     biu.css({
//       left: biuX,
//       top: biuY
//     })
//     biu2.css({
//       left: biuX + 50,
//       top: biuY
//     })
//     runBiu(biu, biuSpeed, biuY)
//     runBiu(biu2, biuSpeed, biuY)
//   }, biuNum);
// }

// //生成敌方战机
// let enemyTimer = null;
// function creatEnmey(model) {
//   let { enemyNum, enemySpeed } = data[model],
//     //big飞机的概率
//     bigPro = 4 - model
//   enemyTimer = setInterval(() => {
//     //难度不同, 生成大飞机的概率不同
//     let $enemy = (randomNum(0, bigPro) == 0) ? $("<div class='enemy-big enemy'></div>") : $("<div class='enemy-small enemy'></div>")
//     $battleGround.append($enemy)
//     $enemy.css({ top: -64, left: randomNum(0, 388) })
//     enemyRun($enemy, enemySpeed)
//     $enemy = null
//   }, enemyNum);
// }

// //子弹运动函数
// function runBiu($biu, s, top) {
//   let speed = s / 100
//   run()
//   function run() {
//     //子弹消失 或者到底, 返回
//     if ($battleGround.has($biu).length == 0 || !$biu) {
//       speed = null
//       return
//     }
//     if (top < 0) {
//       $biu.remove()
//       speed = null
//       return
//     }
//大的1w分
// $('.enemy-big').each(function () {
//   if (testCrash($(this), $biu)) {
//     boom($(this), true)
//     $biu.remove()
//     score += 10000
//     $('.score span').text(score)
//     return
//   }
// })
// //小的5千分
// $('.enemy-small').each(function () {
//   if (testCrash($(this), $biu)) {
//     boom($(this))
//     $biu.remove()
//     score += 5000
//     $('.score span').text(score)
//     return
//   }
// })
//     top -= speed
//     $biu.css({ top })
//     requestAnimationFrame(run)
//   }
// }

// //敌军运动函数
// function enemyRun($enemy, s) {
//   let top = -64,
//     speed = s / 100
//   run()
//   function run() {
//     //如果敌军已销毁, 或者到底了 返回
//     if ($battleGround.has($enemy).length == 0 || $battleGround.has($('.my-plane')).length == 0) {
//       top = null
//       speed = null
//       return
//     }
//     if (top >= battleheight) {
//       $enemy.remove()
//       top = null
//       speed = null
//       return
//     }
//     if (testCrash($enemy, $('.my-plane'))) {
//       boom($enemy, true)
//       boom($('.my-plane'), true, gameOver)
//     }
//     top += speed
//     $enemy.css({ top })
//     requestAnimationFrame(run)
//   }
// }

// jquery碰撞检测
// function testCrash(a, b) {
//   //途中有一方消失了, 默认不检测
//   if (!a || !b) return
//   let aPos = a.position(),
//     bPos = b.position();
//   let aTop = aPos.top,
//     aLeft = aPos.left,
//     aRight = aLeft + a.width(),
//     aBottom = aTop + a.height(),

//     bTop = bPos.top,
//     bLeft = bPos.left,
//     bRight = bLeft + b.width(),
//     bBottom = bTop + b.height();
//   let bol = !(aTop > bBottom || aLeft > bRight || aBottom < bTop || aRight < bLeft)
//   aPos = bPos = aTop = aLeft = aRight = aBottom = bTop = bLeft = bRight = bBottom = null;
//   return bol
// }
