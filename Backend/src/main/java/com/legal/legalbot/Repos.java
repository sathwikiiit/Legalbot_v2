package com.legal.legalbot;


import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.query.Param;

public interface Repos extends MongoRepository<Suit,Long>{
    List<Suit> findByUser(@Param("user")String user);
 }
