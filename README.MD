# PROYECTO DELIAHRESTO

## instalando programas nesesarios:

_Para correr este servidor recomenmentamos instalar los siguientes programas:_

- [Visual Studio Code](https://code.visualstudio.com/): LTS
- [node.js](https://nodejs.org/es/): Version 14.17.6 LTS
- [mySQL](https://dev.mysql.com/downloads/mysql/): Version 8.0.26

## Intalando dependencias:

_Puedes iniciar una terminal con CLT + Ñ (VSCode) luego ejecuta el comando:_

```
$ npm i ó npm install

```

_Al correr uno de estos comando tendras una carpeta nueva llamada node-modules en donde instalaron todas las dependencias_

## Configurando Base de datos:

_Para configurar tu base de datos se debe abrir el gestor de base de datos en este caso se explicara el proceso para Workbench_
_en la ruta => /src/database/ enconstraras un archivo llamado "actions.js" en este archivos buscaras la siguiente constante_
_llamada database en esta se encuentra almacenada la cadena de conexion a la DB_

```
const database = new Sequelize("mysql://Usuario:contraceña@dominio:puerto/nombre DB"); // Ejemplo de datos utilizados

const database = new Sequelize("mysql://root:andresxss2@localhost:3306/deliahresto"); // datos actuales
```

_se recomienda que uses los mismos parametros de lo contrario seguir los parametros dispuestos en el ejemplo para la cadena de conexion_
_Lugo de tener claros estos datos abre el workbench en su ventana principal la cual puedes acceder pinchando en el icono de la casa_
_posterior mente busca el icono del "+" y añade una nueva conexion con todos los datos que anteriormente dispuestos_
_por ultimo ingresa e importa la base de datos adjunta con el nombre "deliahresto.sql"_

## Importando BD en workbench

_Para importar la cadena la base de datos lo primero es que hayas realizado la configuracion inicial en el workbench_
_luego de esto abre la conexcion creada y ve a la pestaña de administracion_
_en esta pestaña tendras una opcion que tendria el nombre de_

```
Data import/restore
```

_has click te saldra un nuevo menu has click en_

```
Import from Drump Project Folder
```

_Busca la ruta en la cual tienes la DB y has click en:_

```
Start import
```

_Nota: Por lo general no se ve este boton por lo que tendras que bajar la pestaña de "output" con ayuda de tu maus_

## iniciando servidor:

_para iniciar el servidor debes correr el comando_

```
$ npm run start
```
