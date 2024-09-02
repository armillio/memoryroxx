<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memory Game</title>
    <style>
        body {
            margin: 0;
            background-color: white;
        }

        #game-container {
            width: 100vw;
            height: 100vh;
            overflow: hidden;
        }
    </style>
</head>

<body>
    <div id="game-container"></div>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js?<?= rand(1, 29292292929); ?>"></script>
    <script src="game.js"></script>
</body>

</html>