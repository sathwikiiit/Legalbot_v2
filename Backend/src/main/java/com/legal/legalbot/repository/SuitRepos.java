package com.legal.legalbot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.legal.legalbot.model.Suit;

@Repository
public interface SuitRepos extends JpaRepository<Suit, Long> {
    List<Suit> findByAdvocatesNameContaining(String advocateName);

    default List<Suit> findByLawyer(String lawyer) {
        return findByAdvocatesNameContaining(lawyer);
    }
}

