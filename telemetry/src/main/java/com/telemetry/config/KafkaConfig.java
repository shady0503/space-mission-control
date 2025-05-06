// src/main/java/com/telemetry/config/KafkaConfig.java
package com.telemetry.config;

import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;

    public static final String TOPIC_TELEMETRY       = "spacecraft-telemetry";
    public static final String TOPIC_PREDICTIONS     = "trajectory-predictions";
    public static final String TOPIC_TELEMETRY_ALERT = "spacecraft-alerts";

    // ─── PRODUCER ─────────────────────────────────────────────────────────────
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,   StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    // ─── CONSUMER ─────────────────────────────────────────────────────────────
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        // 1) Create the Spring-Kafka JsonDeserializer and configure it via setters:
        JsonDeserializer<Object> valueDeserializer = new JsonDeserializer<>(Object.class);
        valueDeserializer.addTrustedPackages("*");
        valueDeserializer.setUseTypeMapperForKey(true);

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG,            groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,   StringDeserializer.class);

        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                valueDeserializer
        );
    }


    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object>
    kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String,Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }

    // ─── TOPIC AUTO-CREATION ─────────────────────────────────────────────────
    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        return new KafkaAdmin(configs);
    }

    @Bean
    public NewTopic telemetryTopic() {
        return new NewTopic(TOPIC_TELEMETRY, 1, (short) 1);
    }

    @Bean
    public NewTopic predictionsTopic() {
        return new NewTopic(TOPIC_PREDICTIONS, 1, (short) 1);
    }

    @Bean
    public NewTopic alertsTopic() {
        return new NewTopic(TOPIC_TELEMETRY_ALERT, 1, (short) 1);
    }
}
