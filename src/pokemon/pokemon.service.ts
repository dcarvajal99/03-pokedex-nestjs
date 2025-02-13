import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PokemonModule } from './pokemon.module';
import * as request from 'supertest';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ){}
  
  
  async  create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    }catch(err){
      this.handdleError(err);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if( !isNaN(Number(term)) ){
      pokemon = await this.pokemonModel.findOne({no: Number(term)});
    }
    if (!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase().trim()});
    }
    
    if (!pokemon) throw new NotFoundException(`Pokemon with term ${term} not found`);
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
      const pokemon = await this.findOne(term);



      if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      
      try{
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    }catch(err){
      this.handdleError(err);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // return id;
    const result = await this.pokemonModel.deleteOne({_id: id});
    if(result.deletedCount === 0) throw new NotFoundException(`Pokemon with id ${id} not found`);

    return;
  }

  private handdleError(err: any){
    if(err.code === 11000){
      throw new BadRequestException(`Pokemon already exists ${JSON.stringify(err.keyValue)}`);
    }
    console.log(err);
    throw new InternalServerErrorException(`Could not create pokemon`);
  }
}
