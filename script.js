const syncBtn = document.getElementById('syncBtn');
const logo = document.getElementById('logo');

syncBtn.addEventListener('click', () => {
  getWPWCInformation();
});

logo.addEventListener('click', () => (location.href = 'index.html'));

async function getWPWCInformation() {
  const urls = [
    'http://localhost:3000/posts',
    'http://localhost:3000/products',
    'http://localhost:3000/orders',
    ' http://localhost:3000/media',
  ];

  try {
    const response = await Promise.all(urls.map(url => fetch(url)));

    response.forEach(res => {
      if (!res.ok) {
        throw new Error(`Error! Status: ${response.status}`);
      }
    });

    const data = await Promise.all(
      response.map(async data => await data.json())
    );

    filterPosts(data[0]);
    filterProducts(data[1]);
    filterOrders(data[2]);
    filterMedia(data[3]);
  } catch (err) {
    console.log(err);
  }
}

/**** FILTER DATA SO ONLY ACCURATE DATA ARE SAVED IN LOCALSTORAGE ****/
function filterPosts(data) {
  // vill bara skicka upp två stycken till LocalStorage
  // vill bara skicka upp titel och bild

  let posts = data.map(post => {
    //const defaultImg = 'woocommerce-placeholder-100x100.png';
    const defaultImg = 'test.png';

    let img;

    if (
      !post._embedded['wp:featuredmedia'] ||
      !post._embedded['wp:featuredmedia'][0].source_url
    ) {
      img = defaultImg;
    } else {
      img = post._embedded['wp:featuredmedia'][0].source_url;
    }

    let obj = {
      title: post.title.rendered,
      image: img,
      link: post.link,
    };
    return obj;
  });

  // Only pass 2 objects to LocalStorage
  const slicePosts = posts.slice(0, 2);

  savePostsLS(slicePosts);
}

function filterProducts(products) {
  console.log('PRODUCTS', products);

  // Vill ha 5 st produkter från 2 olika kategorier
  // Vill visa produktbild, produktnamn, pris, produkt URL och en kortare beskrivning.

  // Skapa array med specika kategornamn och ta bort till 2 resp 3 objekt
  let categoryCycle = products.filter(product =>
    product.categories.some(category => category.name === 'Cyklar')
  );

  let categoryBook = products.filter(product =>
    product.categories.some(category => category.name === 'Böcker')
  );
  const fiveObjects = [
    ...categoryCycle.slice(0, 3),
    ...categoryBook.slice(0, 2),
  ];

  console.log('FIVE OBJECTS', fiveObjects);

  const categories = fiveObjects.map(object => {
    object.categories.forEach(category => {
      //skapa objectet { name: Cyklar, link: http; }
      console.log('object category', category);
      //const keys = 'name';
    });
  });

  let projectsObject = fiveObjects.map(project => {
    let obj = {
      image: project.images[0].src,
      product: project.name,
      //category: categories,
      category: project.categories.map(category => {
        return {
          name: category.name,
          link: 'http://google.com',
          slug: category.slug,
        };
      }),
      price: project.price,
      permalink: project.permalink,
    };
    return obj;
  });

  console.log('NEW PRODUCTS OBJECT ', projectsObject);
  saveProductsLS(projectsObject);
}

function filterOrders(orders) {
  // 2 stycken ordrar från två olika kunder
  // Order id, Status, Totalbelopp, Datum (2 okt 2020)

  let user1 = orders.filter(order => order.customer_id === 1);
  let user2 = orders.filter(order => order.customer_id === 3);

  const twoObjects = [...user1.slice(0, 1), ...user2.slice(0, 1)];

  let ordersObject = twoObjects.map(order => {
    let formatDate = moment(order.date_created).format('MMMM D Y');

    let obj = {
      orderId: order.number,
      orderStatus: order.status,
      total: order.total,
      dateCreated: formatDate,
    };
    return obj;
  });

  saveOrdersLS(ordersObject);
}

function filterMedia(images) {
  const media = images.map(image => {
    let obj = {
      image: image.media_details.sizes.thumbnail.source_url,
    };
    return obj;
  });
  saveMediaLS(media);
}

/**** SAVE DATA TO LOCALSTORAGE ****/
function savePostsLS(posts) {
  localStorage.setItem('posts', JSON.stringify(posts));
}

function saveProductsLS(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

function saveOrdersLS(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function saveMediaLS(media) {
  localStorage.setItem('media', JSON.stringify(media));
}

/**** RETURN DATA FROM LOCALSTORAGE OR EMPTY ARRAY *****/
function getPostsFromLS() {
  return JSON.parse(localStorage.getItem('posts')) || [];
}

function getProductsFromLS() {
  return JSON.parse(localStorage.getItem('products')) || [];
}

function getOrdersFromLS() {
  return JSON.parse(localStorage.getItem('orders')) || [];
}

function getMediaFromLS() {
  return JSON.parse(localStorage.getItem('media')) || [];
}

/**** GET DATA FROM LOCALSTORAGE AND PRINT TO DOM *****/
function renderPosts() {
  const posts = getPostsFromLS();

  posts.forEach(post => {
    const table = document
      .getElementById('postsTable')
      .getElementsByTagName('tbody')[0];

    const tr = document.createElement('tr');
    const tdImg = document.createElement('td');
    const tdTitle = document.createElement('td');

    const image = document.createElement('img');
    image.src = post.image;

    tdTitle.innerHTML = `<a href=${post.link}>${post.title}</a>`;

    tdImg.append(image);
    tr.append(tdImg, tdTitle);
    table.appendChild(tr);
  });
}

function renderProducts() {
  const products = getProductsFromLS();

  products.forEach(product => {
    const table = document
      .getElementById('productsTable')
      .getElementsByTagName('tbody')[0];

    const tr = document.createElement('tr');
    const tdImg = document.createElement('td');
    const tdProduct = document.createElement('td');
    const tdCategories = document.createElement('td');
    const tdPrice = document.createElement('td');

    const image = document.createElement('img');
    image.src = product.image;

    tdProduct.innerHTML = `<a href=${product.permalink}>${product.product}</a>`;

    product.category.forEach(p => {
      console.log(p.slug);
      tdCategories.innerHTML += `<a href=http://localhost:8888/eHandelPlattform_kurs/grupp-projekt-sst/product-category/${p.slug}><p>${p.name}</p></a>`;
    });

    tdPrice.innerHTML = `${product.price} kr`;

    tdImg.append(image);
    //tdCategories.append(paragraph);
    tr.append(tdImg, tdProduct, tdCategories, tdPrice);
    table.appendChild(tr);
  });
}

function renderOrders() {
  const orders = getOrdersFromLS();

  orders.forEach(order => {
    const table = document
      .getElementById('ordersTable')
      .getElementsByTagName('tbody')[0];

    const tr = document.createElement('tr');
    const tdOrderId = document.createElement('td');
    const tdOrderStatus = document.createElement('td');
    const tdOrderAmount = document.createElement('td');
    const tdOrderDate = document.createElement('td');

    tdOrderStatus.className = 'order-status';

    if (order.orderStatus === 'completed') {
      tdOrderStatus.classList.add('completed-order');
    }

    if (order.orderStatus === 'pending') {
      tdOrderStatus.classList.add('pending-order');
    }

    if (order.orderStatus === 'cancelled') {
      tdOrderStatus.classList.add('cancelled-order');
    }

    tdOrderId.innerHTML = order.orderId;
    tdOrderStatus.innerHTML =
      order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);
    tdOrderAmount.innerHTML = `${order.total} kr`;
    tdOrderDate.innerHTML = order.dateCreated;

    tr.append(tdOrderId, tdOrderStatus, tdOrderAmount, tdOrderDate);
    table.appendChild(tr);
  });
}

function renderMedia() {
  const media = getMediaFromLS('media');
  const mediaConatainer = document.getElementById('mediaContainer');
  media.forEach(m => {
    const image = document.createElement('img');
    image.src = m.image;

    console.log(image);
    mediaConatainer.appendChild(image);
  });
}
