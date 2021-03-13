'use strict'

const cards = document.getElementById('cards')
// el creem per acedir als elements del card
const templateCard = document.getElementById('template-card').content
// 4
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content
const items = document.getElementById('items')
const footer = document.getElementById('footer')
// 2
const fragment = document.createDocumentFragment()
// 3.3
let carrito = {}


// 1 - S'inicia una vegada el DOM ha sigut completament cargat i parseado
document.addEventListener('DOMContentLoaded', () => {
    fetchData()
    // 7 - preguntem si localStorage la key carrito existeix... amb pase comvertim el text pla que hem guardat desde pintarCarrito() com estava avans un altre cop
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }

})

// 3 -
cards.addEventListener('click', e => {
    addCarrito(e)

}) 

// 6
items.addEventListener('click', e => {
    btnSumarRestar(e)
})


// 1.1
const fetchData = async () => {
    try{
        const respuesta = await fetch('assets/json/api.json')
        const data = await respuesta.json()
        // console.log(data)
        pintarCards(data)

    }catch(error){
        console.log(error);
    }

}

// 2 - Necesitem pasar la data per poder accedir als elements per crear cada carta de producte de la nostra API
const pintarCards = data => {
    // console.log(data)
    // Cuant fem un recorregut de elements ens combé fer servir el fragment & template
    // recorrem un producte de la nostra API en cada iteració
    data.forEach(producto => {
        // console.log(producto);
        templateCard.querySelector('h5').textContent = producto.title
        templateCard.querySelector('p').textContent = producto.precio
        // setAttribute() per cambiar el contingut del src
        templateCard.querySelector('img').setAttribute('src', producto.thumbnailUrl)
        // agregem el atribut dataset per asignar al data creat amb el -id un valor que agafem del nostre .json
        templateCard.querySelector('.btn-compra').dataset.id = producto.id

        // clonas per enmagatzemar-ho dins del fragment
        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    })

    cards.appendChild(fragment)

}


// 3.1 - 
const addCarrito = e => {
    // capturem el element que estem prement dins de la card
    // console.log(e.target) // i l'ensenyem per consola
    if(e.target.classList.contains('btn-compra')){
        // agafem tot el div que conte la info: h5, p, button al presionar el botó de compra
        // console.log(e.target.parentElement)
        setCarrito(e.target.parentElement)

    }
    e.stopPropagation()
}

// 3.2 - Pasem tot el div que conté la info de compra
const setCarrito = objeto => {
    // console.log(objeto);
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1

    }

    // 3.3 - hasOwnProperty(producto.id - el parametre pasat es la key) se pregunta si existe esta propiedad dentro de carrito, si existe quiere decir que el producto se esta duplicando
    if (carrito.hasOwnProperty(producto.id)){
        // producto cantidad va a ser igual al producto.id del objecte global carrito al que se li sumara 1, llavors mes abaix, cuan torni a fer la copia es fara un copia actualitzada, es rebuscat pero te logica
        producto.cantidad = carrito[producto.id].cantidad + 1

    }

    // carrito id va a ser una copia de producto
    carrito[producto.id] = {...producto}
    // esta creant un objecte afegint tots els objectes diferents que piques i actualitzant la seva cantitat
    // console.log(carrito)
    pintarCarrito()

}

// 4 - afegim la columna al nostre carrito del producte amb la cantita el preu etc...
const pintarCarrito = () => {
    // 4.3
    items.innerHTML = ''
    // console.log(carrito)
    // el object.value es perque estem treballant amb un objecte i no es poden fer servir les funcions dels Arrays com el forEach()
    // 4.1
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('.btn-suma').dataset.id = producto.id
        templateCarrito.querySelector('.btn-resta').dataset.id = producto.id
        // cuidado amb la chapuza
        templateCarrito.querySelector('span').textContent = (producto.cantidad * producto.precio).toFixed(2)
        
    
        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)

    })
    // 4.2
    items.appendChild(fragment)
    // 5
    pintarFooter()

    // 7 - enmagatxemem amb setItem al localStorage (ho pasem a string perque al local storage guarda tot en text plano) lo que vingui del carrito
    localStorage.setItem('carrito', JSON.stringify(carrito))
}

// 5
const pintarFooter = () => {
    footer.innerHTML = ''
    if(Object.keys(carrito).length === 0){
        footer.innerHTML = `
        <th scope="row" colspan="5" style="font-size: 22px;">Your cart is empty</th>
        `
        document.getElementById('total-final').innerHTML = '0'
        document.getElementById('cantidad-cesta').innerHTML = '0'
        // aquest return fa que surti de tota aquest afunció pintarFooter()
        return
    }
    // 5 - per sumar totes les quantitats i els preus entre ells fem servi el reduce
    // reduce() recorrem cada un dels elements de la coleció de objectes, tenim un acomulador i necesitem accedir a la quantitat i al preu així que li pasem els parametres, el acomulador anira acomulant per cada iteració la suma i la sumara amb la anterior que hagi fet
    const nCantidad = Object.values(carrito).reduce((accumulador, {cantidad}) => accumulador + cantidad,0)
    // toFixed(2) arrodoneix a 2 decimals
    const nPrecio = Object.values(carrito).reduce((accumulador, {cantidad, precio}) => accumulador + cantidad * precio,0).toFixed(2)
    // console.log(nPrecio)

    // pinntem la suma del acomulador a la taula
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio
    document.getElementById('total-final').innerHTML = nPrecio
    const cantidadCesta = document.getElementById('cantidad-cesta').innerHTML = nCantidad
    popUpCarrito()

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    const btnVaciar = document.getElementById('vaciar-carrito')
    btnVaciar.addEventListener('click', () => {


        carrito = {}
        pintarCarrito()
  
    })
    // if(cantidadCesta.innerHTML != '0'){
    //     cantidadCesta.style.opacity = '1'
    // }

}

// 6 - detectem els botons que sestan generant de forma dinamica fent servir el event delegation
const btnSumarRestar = e => {
    // console.log(e.target.dataset.id)
    if(e.target.classList.contains('btn-suma')){
        // tenemos nuestro objeto que es producto identificado, acedemos a su cantidad, preguntamos a la cantidad que tenga ese objeto i le sumamos 1
        const producto = carrito[e.target.dataset.id]
        producto.cantidad ++
        // i despues li diem que carrito en su indice sera una copia de producto
        carrito[e.target.dataset.id] = {...producto}
        pintarCarrito()
    }
    
    if(e.target.classList.contains('btn-resta')){
        // tenemos nuestro objeto que es producto identificado, acedemos a su cantidad, preguntamos a la cantidad que tenga ese objeto i le restamos 1
        const producto = carrito[e.target.dataset.id]
        producto.cantidad --

        if(producto.cantidad === 0){
            delete carrito[e.target.dataset.id]
        }

        pintarCarrito()
        
    }

    e.stopPropagation()

}

const popUpCarrito = () => {
    const nCantidad = Object.values(carrito).reduce((accumulador, {cantidad}) => accumulador + cantidad,0)

    if(nCantidad != 0){
        const cantidadCesta = document.getElementById('cantidad-cesta')
        cantidadCesta.style.opacity = '1'
    }else{
        cantidadCesta.style.opacity = '0'
    }
}
