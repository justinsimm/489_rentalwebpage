
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

        //Attach the buttons when the message type is an order
        const orderButtons = item.dataset.type === 'order' ? `
            <form method="POST" action="/rentApproval/${item.dataset.id}" style="display:inline">
                <input type="hidden" name="decision" value="approve">
                <button type="submit" class="btn btnPrimary">Approve</button>
            </form>
            <form method="POST" action="/rentApproval/${item.dataset.id}" style="display:inline">
                <input type="hidden" name="decision" value="decline">
                <button type="submit" class="btn btnSecondary">Decline</button>
            </form>
        ` : '';

        detail.innerHTML = `
            <strong>From: ${item.dataset.sender}</strong>
            <p>${item.dataset.message}</p>
            ${orderButtons}
        `;
    });
});

//Set initial filter
document.querySelector('.inbox_filter').click();