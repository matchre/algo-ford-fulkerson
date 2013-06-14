# Grain Zéro

Permet de générer un dépôt pré-configuré de grain 3.0.

## Tâches Grunt

### generer_depot_grain

Vous pouvez utiliser la tâche *generer_depot_grain* pour générer un nouveau répertoire de grain, avec les fichiers "de base".

La tâche doit être lancée à la racine du dépôt local de *Zéro*, avec un paramètre *NOM_GRAIN* : elle créera un répertoire `../NOM_GRAIN` (relatif au dépôt local de *Zéro*) avec tout le contenu de `./generator/`, c'est-à-dire l'architecture de base d'un grain.

```
$ grunt generer_depot_grain:NOM_GRAIN
```

Attention :
* si le répertoire `../NOM_GRAIN` existe déjà, les fichiers présents dans `./generator/` y seront copiés, écrasant d'éventuels fichiers portant le même nom ;
* la tâche n'applique aucune commande `git` : l'initialisation du dépôt `../NOM_GRAIN` ainsi que l'ajout et le *commit* des fichiers restent à la charge de l'utilisateur.