#!/bin/bash

# Script para executar os testes no WSL

cd ~/TEMP/FIAP/hackaton/Desenvolvimento/Backend

# Define variável de ambiente
export NODE_ENV=test

# Executa os testes
./node_modules/.bin/jest --coverage --runInBand
