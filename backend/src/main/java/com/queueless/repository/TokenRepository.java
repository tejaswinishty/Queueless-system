package com.queueless.repository;

import com.queueless.model.ServiceCategory;
import com.queueless.model.Token;
import com.queueless.model.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByTokenNumber(String tokenNumber);

    List<Token> findByStatusOrderByIssuedAtAsc(TokenStatus status);

    List<Token> findByServiceCategoryAndStatusOrderByIssuedAtAsc(ServiceCategory serviceCategory, TokenStatus status);

    @Query("SELECT COUNT(t) FROM Token t WHERE t.serviceCategory = :category AND t.status = 'WAITING' AND t.issuedAt < :issuedAt")
    long countAheadInCategory(@Param("category") ServiceCategory category, @Param("issuedAt") java.time.LocalDateTime issuedAt);

    @Query("SELECT COUNT(t) FROM Token t WHERE t.status = 'WAITING' AND t.issuedAt < :issuedAt")
    long countAheadTotal(@Param("issuedAt") java.time.LocalDateTime issuedAt);

    List<Token> findTop10ByStatusOrderByCalledAtDesc(TokenStatus status);

    List<Token> findByStatusInOrderByIssuedAtAsc(List<TokenStatus> statuses);

    @Query("SELECT COUNT(t) FROM Token t WHERE t.status = :status")
    long countByStatus(@Param("status") TokenStatus status);
}
