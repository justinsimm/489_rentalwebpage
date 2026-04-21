//Initialize Stripe with passed in key from backend
const stripeKey = document.getElementById('checkout-form').dataset.stripeKey;
const stripe = Stripe(stripeKey);
const elements = stripe.elements();

//Initialize card element
const cardElement = elements.create('card');
cardElement.mount('#card-element');

const form = document.getElementById('checkout-form');
const errorDiv = document.getElementById('card-errors');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  submitBtn.disabled = true;

  //Attempt to create a payment method to pass to the backend
  //Hides user information
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
  });

  if (error) {
    //Possibly update to submit the form here, so errors can be displayed
    //Currently error display reloads the page
    errorDiv.textContent = error.message;
    submitBtn.disabled = false;
  } else {
    //Store the payment Method ID for the backend to grab in the form
    document.getElementById('payment-method-id').value = paymentMethod.id;
    form.submit();
  }
});
