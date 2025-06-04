package com.legal.legalbot.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.legal.legalbot.model.Suit;
@Repository
public interface SuitRepos extends JpaRepository<Suit,Long>{
    List<Suit> findByUser(@Param("created_by")String user);
    Optional<Suit> findById(String id);
    void deleteById(String id);
}

