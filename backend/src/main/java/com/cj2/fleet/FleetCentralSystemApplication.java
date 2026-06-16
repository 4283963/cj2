package com.cj2.fleet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FleetCentralSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(FleetCentralSystemApplication.class, args);
    }
}
