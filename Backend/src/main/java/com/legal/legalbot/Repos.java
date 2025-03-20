package com.legal.legalbot;


import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

public interface Repos extends JpaRepository<Suit,Long>{
    List<Suit> findByUser(@Param("created_by")String user);
 }
