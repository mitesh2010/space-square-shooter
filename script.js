    const canvas =
    document.getElementById('gameCanvas');
    
    const ctx = 
    canvas.getContext('2d');
    
    const scoreElement =
    document.getElementById('score');
    
    const gameOverScreen =
    document.getElementById('gameOverScreen');
    
    const finalScore =
    document.getElementById('finalScore');     
    
    const restartBtn =
    document.getElementById('restartBtn');

    canvas.width =
    Math.min(window.innerWidth, 450);

    canvas.height =
    Math.min(window.innerHeight, 700);

    let score = 0
    let gameActive = true;

    const player ={
        
        x: canvas.width / 2 - 20, 
        
        y: canvas.height - 80,
        
        width: 40,
        
        height: 40,
        
        speed : 7,
        
        color : '#00ccff'
        };

const bullets = [];

const enemies = [];

const particles = [];

const keys = {};

function triggerVibration(pattern) {
    
if ("vibrate" in navigator) {
        navigator.vibrate(pattern);
    }
}

window.addEventListener(
    'keydown',
     e => keys[e.code] = true
);

window.addEventListener(
    'keyup',
     e => keys[e.code] = false
);

canvas.addEventListener(
    'touchmove',
        e => {
            e.preventDefault();

            const touch = e.touches[0];

            const rect = canvas.getBoundingClientRect();

            player.x =(touch.clientX - rect.left)- player.width / 2;

            if (gameActive) {
                keys['Space'] = true;
            }       
        },

        {passive: false}
);

canvas.addEventListener(
    'touchend',
    () => {
        keys['Space'] = false;
    }
);

function spawnEnemy() {
    if (!gameActive) return;
    const size = 30 + Math.random() * 20;

    enemies.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        w: size,
        h: size,
        speed: 3 + (score / 250),
        
        hp:
        Math.ceil(size / 10),
        angle: 0,
        color:
        `hsl(${Math.random() * 360}, 80%, 60%)`
    });

    setTimeout(spawnEnemy, Math.max(120,800 -(score * 3)));
}
    function createExplosion(x, y, color) {
        triggerVibration(40);

        canvas.style.transform = 
        `translate(
        ${(Math.random() - 0.5) * 8}px,
        ${(Math.random() - 0.5) * 8}px)`;

        setTimeout(() => {
            canvas.style.transform = "translate(0, 0)";
        }, 50);

        for (let i = 0; i < 10; i++) {
            particles.push({
                x,
                y,
                vx:
                (Math.random() - 0.5) * 6,
                vy:
                (Math.random() - 0.5) * 6,
                life: 25,

                color
            });
        }   
    }

    function endGame(message) {
        gameActive = false;
        triggerVibration([200, 100, 200]);
        finalScore.innerText = `${message}\nSCORE: ${score}`;

        gameOverScreen.style.display = 'flex';
    }

    function update() {
            if (!gameActive) return;   
            if (keys['ArrowLeft'] && player.x > 0) {
                player.x -= player.speed;
            }

            if (
                keys['ArrowRight'] 
                && player.x < canvas.width - player.width) {
                player.x += player.speed;
            }

            if (keys['Space']) {
                if (bullets.length === 0 || 
                  bullets[bullets.length - 1].y < player.y - 15) {
                    bullets.push({
                        x: player.x + player.width / 2 - 2,
                        y: player.y,
                        w: 4,
                        h: 15,
                    });
                }
            }

            bullets.forEach((b,i) => {
                b.y -= 18;
                if (b.y < 0) {
                    bullets.splice(i, 1);
                }  
            });

            enemies.forEach((en, i) => {
                en.y += en.speed;
                en.angle += 0.05;
                bullets.forEach((b, bi) => {
                    if (
                        b.x < en.x + en.w &&
                        b.x + b.w > en.x &&
                        b.y < en.y + en.h &&
                        b.y + b.h > en.y

                    ) {
                        en.hp--;
                        bullets.splice(bi, 1);
                        if (en.hp <= 0) {
                            createExplosion(en.x + en.w / 2,
                                         en.y + en.h / 2,
                                          en.color);
                            enemies.splice(i, 1);
                            score += 10;

                            scoreElement.innerText = `SCORE: ${score}`;
                        }
                    }   
                });

                if (
                    player.x < en.x + en.w &&
                    player.x + player.width > en.x &&
                    player.y < en.y + en.h &&
                    player.y + player.height > en.y
                ) {
                    
                    document.body.style.backgroundColor = '#300';

                    endGame("SHIP DESTROYED");
                }
                if (en.y > canvas.height) {
                    document.body.style.backgroundColor = '#300';
                    endGame("INTRUDER ESCAPED");
                }
            });

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            });
        }
        function draw() {
            ctx.fillStyle = 'black';

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height);

            ctx.fillStyle = 'white';

            for (let i = 0; i < 40; i++) {
                
                ctx.fillRect(
                    Math.random() * canvas.width,
                (
                    Math.random() * canvas.height 
                    + performance.now() / 20) 
                % canvas.height, 
                1,
                1);
                }

                ctx.shadowBlur = 15;
                ctx.shadowColor = player.color;
                ctx.fillStyle = player.color;

                ctx.beginPath();

                ctx.moveTo(player.x + player.width / 2, player.y);

                ctx.lineTo(player.x, player.y + player.height);
                ctx.lineTo(player.x + player.width, 
                           player.y + player.height);
                

                ctx.fill();
                ctx.shadowColor = '#ff0055';
                ctx.fillStyle = '#ff0055';

                bullets.forEach ((b) => {

                    ctx.fillRect(
                        b.x,
                         b.y,
                          b.w,
                           b.h);
                });
            enemies.forEach((en) => {
                    ctx.save ();

                    ctx.translate(en.x + en.w / 2,
                         en.y + en.h / 2);

                    ctx.rotate(en.angle);

                    ctx.shadowColor = en.color;

                    ctx.fillStyle = en.color;

                    ctx.fillRect(-en.w / 2, -en.h / 2,
                                 en.w, en.h);

                    ctx.fillStyle = 'black';

                    ctx.fillRect(-en.w / 2 + 5,
                                     -en.h / 2 + 5 ,
                                     5,
                                     5);
                    ctx.fillRect(en.w / 2 - 10,
                                 -en.h / 2 + 5,
                                 5,
                                 5);

                    ctx.restore();
                });

                    ctx.shadowBlur = 0;

                particles.forEach((p) => {
                    ctx.fillStyle = p.color;
                    
                    ctx.fillRect(p.x, p.y, 2, 2);
                });

                requestAnimationFrame(() => {
                    update();

                    draw();
                });
            }

            restartBtn.addEventListener(
                'click',
                () => {

                    location.reload();
                
                }
            );

            spawnEnemy();
            draw();