
//Event listener for inbox-filter
//Retreives messages with the corresponding tag
document.querySelectorAll('.inbox_filter').forEach(filter => {
    filter.addEventListener('click', () => {
        const tag = filter.dataset.tag;
        document.querySelectorAll('.message-item').forEach(item => {
            item.style.display = item.dataset.type === tag ? '' : 'none';
        });

        //Reset message box
        const detail = document.querySelector('.message-detail');
        detail.innerHTML = `
            <p>Select a message to see details</p>
        `;
    })
});

//Event listener for message-item
//Retreives and displays related message in message-detail
document.querySelectorAll('.message-item').forEach(item => {
    item.addEventListener('click', () => {
        const detail = document.querySelector('.message-detail');
        detail.innerHTML = `
            <strong>From: ${item.dataset.sender}</strong>
            <p>${item.dataset.message}</p>
        `;
    });
});