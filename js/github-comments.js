document.addEventListener('DOMContentLoaded', function() {
    fetch("https://api.github.com/repos/EstebanForge/actitud-studio-comments/issues/"+comment_id+"/reactions", {
        headers: {
            'Accept': 'application/vnd.github.squirrel-girl-preview'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        loadReactions(data);
    })
    .catch(error => {
        console.error('Error fetching reactions:', error);
    });

    fetch("https://api.github.com/repos/EstebanForge/actitud-studio-comments/issues/"+comment_id+"/comments", {
        headers: {
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => response.json())
    .then(data => {
        loadComments(data);
    })
    .catch(error => {
        console.error('Error fetching comments:', error);
    });
});

function loadComments(data) {
    const commentsContainer = document.getElementById('comments');

    // No comments?
    if (data.length === 0) {
        // Add "No comments" message after .comments-title
        const noComments = document.createElement('div');
        noComments.classList.add('comment');
        noComments.textContent = 'No comments yet.';
        commentsContainer.appendChild(noComments);
        return;
    }

    data.forEach(comment => {
        const commentDiv = document.createElement('div');
        const headerDiv = document.createElement('div');
        const userName = document.createElement('a');
        const messageBody = document.createElement('div');

        userName.classList.add('comment-username');
        userName.textContent = comment.user.login;

        headerDiv.classList.add('comment-header');
        headerDiv.appendChild(userName);

        messageBody.classList.add('comment-body');
        messageBody.innerHTML = new showdown.Converter().makeHtml(comment.body);

        commentDiv.classList.add('comment');
        commentDiv.appendChild(headerDiv);
        commentDiv.appendChild(messageBody);

        commentsContainer.appendChild(commentDiv);
    });
}

function loadReactions(data) {
    // https://gist.github.com/rxaviers/7360908
    const emotes = {
        '+1': '&#x1F44D;',
        '-1': '&#x1F44E;',
        'thumbsup': '&#x1F44D;',
        'thumbsdown': '&#x1F44E;',
        'laugh': '&#x1F604;',
        'hooray': '&#x1F389;',
        'heart': '&#x2764;&#xFE0F;',
        'smile': '&#x1F604;',
        'confused': '&#x1F615;',
        'tada': '&#x1F389;',
        'rocket': '&#x1F680;',
        'star': '&#x2B50;',
        'eyes': '&#x1F440;',
    };

    const emojiCount = data.reduce((acc, item) => {
        const emote = item.content;
        acc[emote] = (acc[emote] || 0) + 1;
        return acc;
    }, {});

    const reactionsContainer = document.getElementById('reactions');

    // No reactions?
    if (Object.keys(emojiCount).length === 0) {
        reactionsContainer.style.display = 'none';
        return;
    }

    Object.entries(emotes).forEach(([key, value]) => {
        if (key in emojiCount) {
            const reaction = document.createElement('span');
            reaction.classList.add('reaction');
            reaction.textContent = `${emojiCount[key]} `;

            const reactionIcon = document.createElement('span');
            reactionIcon.innerHTML = value;

            reaction.appendChild(reactionIcon);
            reactionsContainer.appendChild(reaction);
        }
    });

    if (data.length > 0) {
        reactionsContainer.style.display = 'block';
    }
}
