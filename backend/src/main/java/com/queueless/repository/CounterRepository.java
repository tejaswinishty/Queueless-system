package com.queueless.repository;

import com.queueless.model.Counter;
import com.queueless.model.CounterStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CounterRepository extends JpaRepository<Counter, Long> {
    Optional<Counter> findByCounterNumber(Integer counterNumber);

    List<Counter> findAllByOrderByCounterNumberAsc();

    long countByStatus(CounterStatus status);
}
