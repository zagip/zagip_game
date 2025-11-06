package ru.vlppz.zgbackend.DB.Code;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodeRepository extends JpaRepository<Code, Long> {
    Optional<Code> findByCodeAndActiveTrue(String code);
}