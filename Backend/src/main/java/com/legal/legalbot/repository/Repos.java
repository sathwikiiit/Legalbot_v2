package com.legal.legalbot.repository;


import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import com.legal.legalbot.model.Suit;

public interface Repos extends JpaRepository<Suit,Long>{
    List<Suit> findByUser(@Param("created_by")String user);
 }
