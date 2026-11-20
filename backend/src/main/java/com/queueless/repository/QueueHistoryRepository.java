package com.queueless.repository;

import com.queueless.model.QueueHistory;
import com.queueless.model.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueueHistoryRepository extends JpaRepository<QueueHistory, Long> {

    List<QueueHistory> findByHourOfDay(Integer hourOfDay);

    List<QueueHistory> findByDayOfWeek(String dayOfWeek);

    @Query("SELECT qh.hourOfDay, AVG(qh.footfallCount), AVG(qh.averageWaitMinutes) " +
           "FROM QueueHistory qh GROUP BY qh.hourOfDay ORDER BY qh.hourOfDay ASC")
    List<Object[]> findAverageCrowdByHour();

    @Query("SELECT qh.hourOfDay, AVG(qh.footfallCount), AVG(qh.averageWaitMinutes) " +
           "FROM QueueHistory qh WHERE qh.dayOfWeek = :dayOfWeek GROUP BY qh.hourOfDay ORDER BY qh.hourOfDay ASC")
    List<Object[]> findAverageCrowdByDayOfWeek(@Param("dayOfWeek") String dayOfWeek);

    @Query("SELECT qh.serviceCategory, AVG(qh.averageServeMinutes) " +
           "FROM QueueHistory qh GROUP BY qh.serviceCategory")
    List<Object[]> findAverageServeTimeByCategory();
}
